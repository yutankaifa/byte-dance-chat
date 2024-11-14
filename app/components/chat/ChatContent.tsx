import { useChatStore } from "~/store";
import { useEffect, useRef, useState } from "react";
import { MessageInter } from "~/types";
import Markdown from "~/components/chat/Markdown";
import { useScrollToBottom } from "~/hooks";
import FileCard from "~/components/chat/FileCard";

export default function ChatContent() {
  const store = useChatStore();
  const [messages, setMessages] = useState<MessageInter[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottom = scrollRef?.current
    ? Math.abs(
        scrollRef.current.scrollHeight -
          (scrollRef.current.scrollTop + scrollRef.current.clientHeight)
      ) <= 1
    : false;
  const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(
    scrollRef,
    isScrolledToBottom
  );
  useEffect(() => {
    scrollDomToBottom();
    setMessages(store.messages);
  }, [store]);
  return (
    <div ref={scrollRef} className="overflow-y-auto h-full">
      {messages.map((item, index) => (
        <div className="my-3" key={index}>
          {item.role == "assistant" && (
            <div className="flex justify-start">
              <Markdown>{item.content}</Markdown>
            </div>
          )}
          {item.role == "user" && (
            <div className="flex items-end flex-col gap-3">
              <div className="flex flex-wrap gap-3 justify-end">
                {item.files?.map((item, index) => (
                  <FileCard key={index} index={index} item={item} />
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
