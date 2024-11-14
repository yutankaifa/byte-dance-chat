import { Button } from "../ui/button";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { useChatStore } from "~/store";
import { MessageInter } from "~/types";
import TextareaAutosize from "react-textarea-autosize";
import { PaperclipIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { allowFileList, FileInfoInter, FileToText } from "~/utils/fileToText";
import { cloneDeep } from "lodash-es";
import FileCard from "~/components/chat/FileCard";
import { parseSSEResponse } from "~/utils/sse";

export default function ChatInput() {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileInfos, setFileInfos] = useState<FileInfoInter[]>([]);
  const store = useChatStore();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const buildFileText = () => {
    let text = "";
    if (fileInfos.length > 0) {
      fileInfos.forEach((fileInfo, index) => {
        text += `第${index + 1}个文件内容如下` + fileInfo.text;
      });
    }
    return text;
  };
  const resetInput = () => {
    setContent("");
    setFileInfos([]);
  };
  const sendMessage = async () => {
    if (isLoading) return;
    if (!content.trim()) {
      toast.warning("文本不能为空");
      return;
    }
    let text = buildFileText();
    if (text) {
      text = content + "以下是上传的相关文件：" + text;
    }
    setIsLoading(true);
    resetInput();
    const user: MessageInter = { role: "user", content, files: fileInfos };
    store.setMessages([...store.messages, user]);
    const result: MessageInter = { role: "assistant", content: "" };
    const json = {
      model: "ep-20241113165448-9j4rr",
      stream: true,
      messages: [...store.messages, { role: "user", content: text || content }],
    };
    // https://ark.cn-beijing.volces.com/api/v3/chat/completions
    const res = await fetch("/api", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + "259ffcc9-bb80-48bd-9bb9-196bfe8455eb",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
    // console.log("res", res);
    if (!res.ok) {
      const error = await res.text();
      console.log("error", error);
    }
    await parseSSEResponse(res, (message) => {
      if (message === "[DONE]") {
        // console.log("完成", result);
        store.setMessages([...store.messages, user, result]);
        setIsLoading(false);
        return;
      }
      let data;
      try {
        data = JSON.parse(message);
      } catch (err) {
        console.error(err);
        return;
      }
      if (data?.choices?.length) {
        const delta = data.choices[0].delta;
        if (delta?.content) {
          result.content += delta.content;
          store.setMessages([...store.messages, user, result]);
        }
      }
    });
  };
  const onKeyDown = async (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        const pos = inputRef.current?.selectionStart || 0;
        setContent((pre) => `${pre.slice(0, pos)}\n${pre.slice(pos)}`);
        setTimeout(() => {
          inputRef.current!.setSelectionRange(pos + 1, pos + 1);
        }, 0);
      } else {
        await sendMessage();
      }
    }
  };
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const arr = cloneDeep(fileInfos);
    const fileInfo = await FileToText(e);
    if (fileInfo) arr.push(fileInfo);
    setFileInfos(arr);
    inputRef.current?.focus();
  };
  return (
    <div className="fixed bottom-0 left-0 w-full p-4 bg-white">
      <div className="max-w-screen-md mx-auto">
        <div className="flex flex-wrap my-3 gap-3">
          {fileInfos.map((item, index) => (
            <FileCard key={index} index={index} item={item} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-gray-100 flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <label className="cursor-pointer">
                      <PaperclipIcon className="cursor-pointer" />
                      <input
                        type="file"
                        accept={allowFileList.join(",")}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        onClick={(event) => {
                          event.target.value = null;
                        }}
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{"允许上传的文件格式有：" + allowFileList.join(",")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TextareaAutosize
              ref={inputRef}
              value={content}
              className={cn(
                "resize-none hover:resize overflow-x-hidden overflow-y-auto w-full outline-none text-sm bg-transparent leading-6 text-primary-text scrollbar-thin placeholder:text-gray-400"
              )}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={onKeyDown}
              minRows={1}
              maxRows={5}
              autoComplete="off"
              placeholder={"发消息，输入或Shift+Enter换行"}
            />
          </div>
          <Button disabled={isLoading} onClick={sendMessage}>
            {isLoading ? "回复中" : "发送"}
          </Button>
        </div>
      </div>
    </div>
  );
}
