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
import { allowFileList, allowImageList } from "~/utils/fileToText";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cloneDeep } from "lodash-es";
import { asyncChat, asyncFileUpload } from "~/data";

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
      fileList.forEach((fileInfo) =>
        arr.push({
          type: "file",
          file_id: fileInfo.file_id,
        })
      );
    }
    if (imageList.length > 0) {
      content_type = "object_string";
      imageList.forEach((fileInfo) =>
        arr.push({
          type: "image",
          file_id: fileInfo.file_id,
        })
      );
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
    updateStoreMessage(user);
    const result: MessageInter = {
      role: "assistant",
      text: "",
      suggestions: [],
    };
    const newMessage = buildMessage(v);
    const _messages = [...messages, newMessage];
    const res = await asyncChat(_messages);
    if (!res.ok) {
      const error = await res.text();
      console.log("error", error);
    }
    await parseSSEResponse(res, (message) => {
      if (message.includes("[DONE]")) {
        if (store.sendMessageFlag) store.setSendMessageFlag("");
        updateStoreMessage(user, result);
        setMessages([
          ..._messages,
          { role: "assistant", content: result.text } as MessageApiInter,
        ]);
        setIsLoading(false);
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
  const updateStoreMessage = (user, result?: any) => {
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
  const onKeyDown = async (e: any) => {
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
    console.log("e", e);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await handleFileToBase64(file);
      const res = await asyncFileUpload(file);
      console.log("res", res);
      if (res.code == 0) {
        const { file_name, id } = res.data;
        if (type == "file")
          setFiles((prevState) => [
            ...prevState,
            { name: file_name, file_id: id, base64 },
          ]);
        else if (type == "image")
          setImages((prevState) => [
            ...prevState,
            { name: file_name, file_id: id, base64 },
          ]);
      } else toast.error("文件上传失败!");
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };
  const handleFileToBase64 = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };

      reader.onerror = () => reject(new Error("File reading error"));

      reader.readAsDataURL(file);
    });
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
              <div
                className="hover:opacity-80 rounded-xl border relative"
                key={index}
              >
                <img
                  src={item.base64}
                  className="w-14 h-14 "
                  key={index}
                  alt=""
                />
                <XMarkIcon
                  width={16}
                  onClick={() => removeFile(index, "image")}
                  className="absolute right-0 top-0 translate-y-[-50%] translate-x-1/2 hidden group-hover:block"
                />
              </div>
            ))}
          </div>
        )}
        {files.length > 0 && (
          <div className="flex flex-wrap my-3 gap-3">
            {files.map((item, index) => (
              <div className="relative" key={index}>
                <FileCard index={index} item={item} />
                <XMarkIcon
                  width={16}
                  onClick={() => removeFile(index, "file")}
                  className="absolute right-0 top-0 translate-y-[-50%] translate-x-1/2 hidden group-hover:block"
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-gray-100 flex items-center gap-4 flex-1">
            <div className="flex items-center justify-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <label>
                      <PaperclipIcon width={22} className="cursor-pointer" />
                      <input
                        type="file"
                        accept={allowFileList.join(",")}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "file")}
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <label>
                      <PhotoIcon width={24} className="cursor-pointer" />
                      <input
                        type="file"
                        accept={allowImageList.join(",")}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "image")}
                        onClick={(event) => {
                          event.target.value = null;
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
