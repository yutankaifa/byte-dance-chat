import { useChatStore } from "~/store";
import { useEffect, useRef, useState } from "react";
import { MessageInter } from "~/types";
import Markdown from "~/components/chat/Markdown";
import FileCard from "~/components/chat/FileCard";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import pkg from "react-copy-to-clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
const { CopyToClipboard } = pkg;
export default function ChatContent() {
  const store = useChatStore();
  const [messages, setMessages] = useState<MessageInter[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setMessages(store.messages);
  }, [store]);

  useEffect(() => {
    const distance =
      window.innerHeight - (scrollRef.current?.scrollHeight || 0) - 100;
    if (timer.current || distance > 0) return;
    timer.current = setTimeout(() => {
      ScrollToBottom();
      clearTimeout(timer.current);
      timer.current = null;
    }, 800);
  }, [messages]);

  const ScrollToBottom = () => {
    if (scrollRef.current) {
      window.scrollTo({
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
  return (
    <div ref={scrollRef} className="overflow-y-auto h-full">
      {messages.map((item, index) => (
        <div className="my-3" key={index}>
          {item.role === "assistant" && (
            <div className="flex justify-start group">
              <div>
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
              </div>
            </div>
          )}
          {item.role === "user" && (
            <div className="flex items-end flex-col gap-3">
              <div className="flex flex-wrap gap-3 justify-end">
                {item.images?.map((fileItem, fileIndex) => (
                  <img
                    src={fileItem.base64}
                    className="w-14 h-14 rounded-3xl "
                    key={fileIndex}
                    alt=""
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                {item.files?.map((fileItem, fileIndex) => (
                  <FileCard key={fileIndex} index={fileIndex} item={fileItem} />
                ))}
              </div>
              <div className="max-w-lg bg-gray-200 px-4 py-2 rounded-3xl">
                <pre>{item.text}</pre>
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="min-h-[120px]"></div>
    </div>
  );
}
