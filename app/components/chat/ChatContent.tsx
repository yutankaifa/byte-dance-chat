import { useChatStore } from "~/store";
import { useEffect, useRef, useState } from "react";
import { MessageInter } from "~/types";
import Markdown from "~/components/chat/Markdown";
import FileCard from "~/components/chat/FileCard";
import { throttle } from "lodash-es";

export default function ChatContent() {
  const store = useChatStore();
  const [messages, setMessages] = useState<MessageInter[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(store.messages);
  }, [store]);

  useEffect(() => {
    ScrollToBottom();
  }, [messages]);

  const ScrollToBottom = throttle(() => {
    if (scrollRef.current) {
      window.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 1200);
  return (
    <div ref={scrollRef} className="overflow-y-auto h-full">
      {messages.map((item, index) => (
        <div className="my-3" key={index}>
          {item.role === "assistant" && (
            <div className="flex justify-start">
              <Markdown>{item.content}</Markdown>
            </div>
          )}
          {item.role === "user" && (
            <div className="flex items-end flex-col gap-3">
              <div className="flex flex-wrap gap-3 justify-end">
                {item.files?.map((fileItem, fileIndex) => (
                  <FileCard key={fileIndex} index={fileIndex} item={fileItem} />
                ))}
              </div>
              <div className="max-w-lg bg-blue-300 p-2 rounded-2xl">
                <p className="text-white">{item.content}</p>
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="min-h-[120px]"></div>
    </div>
  );
}
