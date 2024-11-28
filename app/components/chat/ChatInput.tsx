import { Button } from "../ui/button";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { useChatStore } from "~/store";
import {
  ChatContentType,
  content_type,
  FileInfoInter,
  MessageApiInter,
  MessageInter,
  object_string_type,
  ResponseMessageType,
} from "~/types";
import TextareaAutosize from "react-textarea-autosize";
import { PaperclipIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import FileCard from "~/components/chat/FileCard";
import { parseSSEResponse } from "~/utils/sse";
import { allowFileList, allowImageList } from "~/utils/file";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { ChatError } from "~/utils/error";
import { cloneDeep } from "lodash-es";
import { asyncChat } from "~/apis/data";
import ImageCard from "./ImageCard";

export default function ChatInput({ type }: ChatContentType) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileInfoInter[]>([]);
  const [images, setImages] = useState<FileInfoInter[]>([]);
  const [messages, setMessages] = useState<MessageApiInter[]>([]);
  const store = useChatStore();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (store.sendMessageFlag) sendMessage(store.sendMessageFlag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sendMessageFlag]);

  const buildContent = (
    text: string,
    fileList: FileInfoInter[],
    imageList: FileInfoInter[]
  ) => {
    const arr = [];
    let content_type: content_type = "text";
    if (text)
      arr.push({
        type: "text",
        text,
      });
    if (fileList.length > 0) {
      content_type = "object_string";
      fileList.forEach((fileInfo) => {
        if (fileInfo.status == "uploaded")
          arr.push({
            type: "file",
            file_id: fileInfo.file_id,
          });
      });
    }
    if (imageList.length > 0) {
      content_type = "object_string";
      imageList.forEach((fileInfo) => {
        if (fileInfo.status == "uploaded")
          arr.push({
            type: "image",
            file_id: fileInfo.file_id,
          });
      });
    }
    return { arr, content_type };
  };
  const buildMessage = (v?: string) => {
    const { arr, content_type } = buildContent(v || prompt, files, images);
    console.log("arr", arr);
    return {
      role: "user",
      content: JSON.stringify(arr),
      content_type,
    } as MessageApiInter;
  };
  const resetInput = () => {
    setPrompt("");
    setFiles([]);
    setImages([]);
  };
  const sendMessage = async (v?: string) => {
    if (isLoading) return;
    if (!v && !prompt.trim()) {
      toast.warning("文本不能为空");
      return;
    }
    setIsLoading(true);
    resetInput();
    const user: MessageInter = {
      role: "user",
      text: v || prompt,
      files,
      images,
    };
    const result: MessageInter = {
      role: "assistant",
      text: "",
      suggestions: [],
    };
    updateStoreMessage(user, result);
    const newMessage = buildMessage(v);
    const _messages = [...messages, newMessage];
    try {
      const res = await asyncChat(_messages);
      const contentType = res.headers.get("Content-Type");
      if (contentType?.includes("text/event-stream")) {
        await handleSSEResponse(res, user, result, _messages);
      } else {
        const jsonData = await res.json();
        throw new Error(jsonData.msg || "请求失败");
      }
    } catch (err) {
      const error = ChatError.fromError(err);
      setIsLoading(false);
      result.error = error.message;
      updateStoreMessage(user, result);
    } finally {
      if (store.sendMessageFlag) store.setSendMessageFlag("");
      if (result.suggestions?.length == 0) result.suggestions = undefined;
      updateStoreMessage(user, result);
      setIsLoading(false);
    }
  };
  const handleSSEResponse = async (
    res: Response,
    user: MessageInter,
    result: MessageInter,
    _messages: MessageApiInter[]
  ) => {
    await parseSSEResponse(res, (message) => {
      if (message.includes("[DONE]")) {
        setMessages([
          ..._messages,
          { role: "assistant", content: result.text } as MessageApiInter,
        ]);
        return;
      }
      let data: ResponseMessageType;
      try {
        data = JSON.parse(message);
      } catch (err) {
        console.error(err);
        return;
      }
      if (["answer"].includes(data?.type) && !data.created_at) {
        result.text += data?.content;
        updateStoreMessage(user, result);
      } else if (data?.type === "follow_up") {
        result.suggestions?.push(data.content);
      }
    });
  };
  const updateStoreMessage = (user: MessageInter, result?: MessageInter) => {
    if (result) {
      if (type === "page") store.setMessages([...store.messages, user, result]);
      else if (type === "inline")
        store.setMessagesInline([...store.messages_inline, user, result]);
    } else {
      if (type === "page") {
        store.setMessages([...store.messages, user]);
      } else if (type === "inline") {
        store.setMessagesInline([...store.messages_inline, user]);
      }
    }
  };
  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        const pos = inputRef.current?.selectionStart || 0;
        setPrompt((pre) => `${pre.slice(0, pos)}\n${pre.slice(pos)}`);
        setTimeout(() => {
          inputRef.current!.setSelectionRange(pos + 1, pos + 1);
        }, 0);
      } else {
        await sendMessage();
      }
    }
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    type: object_string_type
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type == "file")
      setFiles([...files, { file, name: file.name }]);
    else if (type == "image")
      setImages([...images, { file, name: file.name }]);
    else toast.error("不支持的文件类型");
  };

  const removeFile = (index: number, type: object_string_type) => {
    if (type == "file") {
      const clone_file = cloneDeep(files);
      clone_file.splice(index, 1);
      setFiles(clone_file);
    } else if (type == "image") {
      const clone_img = cloneDeep(images);
      clone_img.splice(index, 1);
      setImages(clone_img);
    }
  };
  return (
    <div className={cn("w-full bg-white")}>
      <div className="max-w-screen-md mx-auto bg-gray-100 p-2 rounded-2xl group">
        {images.length > 0 && (
          <div className="flex flex-wrap m-3 gap-3">
            {images.map((item, index) => (
              <ImageCard
                key={index}
                file={item}
                index={index}
                removeFile={() => removeFile(index, "image")}
                updateFile={(file) => {
                  const clone_img = cloneDeep(images);
                  clone_img[index] = file;
                  setImages(clone_img);
                }}
              />
            ))}
          </div>
        )}
        {files.length > 0 && (
          <div className="flex flex-wrap my-3 gap-3">
            {files.map((item, index) => (
              <FileCard
                key={index}
                file={item}
                index={index}
                removeFile={() => removeFile(index, "file")}
                updateFile={(file) => {
                  const clone_file = cloneDeep(files);
                  clone_file[index] = file;
                  setFiles(clone_file);
                }}
              />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-gray-100 flex items-center gap-4 flex-1">
            <div className="flex items-center justify-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger aria-label="选择文件">
                    <label>
                      <PaperclipIcon width={22} className="cursor-pointer" />
                      <input
                        type="file"
                        accept={allowFileList.join(",")}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "file")}
                        onClick={(event) => {
                          (event.target as HTMLInputElement).value = "";
                        }}
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{"允许上传的文件格式有：" + allowFileList.join(",")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger aria-label="选择图片">
                    <label>
                      <PhotoIcon width={24} className="cursor-pointer" />
                      <input
                        type="file"
                        accept={allowImageList.join(",")}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "image")}
                        onClick={(event) => {
                          (event.target as HTMLInputElement).value = "";
                        }}
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{"允许上传的图片格式有：" + allowImageList.join(",")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TextareaAutosize
              ref={inputRef}
              value={prompt}
              className={cn(
                "resize-none hover:resize overflow-x-hidden overflow-y-auto w-full outline-none text-sm bg-transparent leading-6 text-primary-text scrollbar-thin placeholder:text-gray-400"
              )}
              style={{ height: 24 }}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
              minRows={1}
              maxRows={5}
              autoComplete="off"
              placeholder={"发消息，Shift+Enter换行"}
            />
          </div>
          <Button disabled={isLoading} onClick={() => sendMessage()}>
            {isLoading ? "回复中" : "发送"}
          </Button>
        </div>
      </div>
    </div>
  );
}
