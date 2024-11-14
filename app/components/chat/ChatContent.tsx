import { useChatStore } from "~/store";
import { useEffect, useRef, useState } from "react";
import { MessageInter } from "~/types";
import Markdown from "~/components/chat/Markdown";
import FileCard from "~/components/chat/FileCard";

export default function ChatContent() {
  const store = useChatStore();
  const [messages, setMessages] = useState<MessageInter[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef(null);

  useEffect(() => {
    setMessages(store.messages);
  }, [store]);

  useEffect(() => {
    if (timer.current) return;
    timer.current = setTimeout(() => {
      ScrollToBottom();
      clearTimeout(timer.current);
      timer.current = null;
    }, 800);
  }, [messages]);

  const ScrollToBottom = () => {
    console.log("111111");
    if (scrollRef.current) {
      window.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
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
