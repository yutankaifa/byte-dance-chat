import { useChatStore } from "~/store";
import { useEffect, useRef, useState } from "react";
import { ChatContentType, MessageInter } from "~/types";
import Markdown from "~/components/markdown";
import FileCard from "~/components/chat/FileCard";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import pkg from "react-copy-to-clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { MdSkeleton, SuggestionSkeleton } from "~/components/chat/ChatSkeleton";
const { CopyToClipboard } = pkg;

export default function ChatContent({ type }: ChatContentType) {
  const store = useChatStore();
  const [messages, setMessages] = useState<MessageInter[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (type === "inline") {
      setMessages(store.messages_inline);
    } else {
      setMessages(store.messages);
    }
  }, [store, type]);

  useEffect(() => {
    const distance =
      window.innerHeight - (scrollRef.current?.scrollHeight || 0) - 100;
    if (timer.current || distance > 0) return;
    timer.current = setTimeout(() => {
      ScrollToBottom();
      clearTimeout(timer.current as NodeJS.Timeout);
      timer.current = null;
    }, 800);
  }, [messages]);

  const ScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);

  const sendMessage = (v: string) => {
    store.setSendMessageFlag(v);
  };
  return (
    <div
      ref={scrollRef}
      className={cn("overflow-y-auto flex-1", type === "inline" && "h-[400px]")}
    >
      {messages.map((item, index) => (
        <div className="my-3" key={index}>
          {item.role === "assistant" && (
            <div>
              {!item.error ? (
                item.text ? (
                  <div className="group">
                    <Markdown>{item.text}</Markdown>
                    <div className="w-full hidden justify-end group-hover:flex">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CopyToClipboard
                              text={item.text}
                              onCopy={() => setCopied(true)}
                            >
                              <div className="flex flex-row items-center gap-2 cursor-pointer w-fit ml-1">
                                {copied ? (
                                  <CheckIcon width={20} />
                                ) : (
                                  <ClipboardDocumentIcon width={20} />
                                )}
                              </div>
                            </CopyToClipboard>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>复制</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="min-h-[20px] block group-hover:hidden"></div>
                  </div>
                ) : (
                  <MdSkeleton />
                )
              ) : (
                <p className="text-red-500 break-words">{item.error}</p>
              )}
              {index == messages.length - 1 &&
                item.suggestions &&
                (item.suggestions?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {item.suggestions.map((item, index) => (
                      <div key={index}>
                        <button
                          onClick={() => sendMessage(item)}
                          className="text-blue-400 hover:text-blue-500 cursor-pointer"
                        >
                          {item}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SuggestionSkeleton />
                ))}
            </div>
          )}
          {item.role === "user" && (
            <div className={"flex items-end flex-col gap-3"}>
              {item.images && item.images.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-end">
                  {item.images?.map((fileItem, fileIndex) => (
                    <img
                      src={fileItem.base64}
                      className="w-14 h-14 rounded-xl "
                      key={fileIndex}
                      alt={fileItem.name}
                    />
                  ))}
                </div>
              )}
              {item.files && item.files.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-end">
                  {item.files?.map((fileItem, fileIndex) => (
                    <FileCard
                      key={fileIndex}
                      file={fileItem}
                    />
                  ))}
                </div>
              )}
              <div className="max-w-lg bg-gray-200 px-4 py-2 rounded-xl">
                <pre className="whitespace-pre-wrap break-words">{item.text}</pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
