import type { MetaFunction } from "@remix-run/node";
import ChatInput from "~/components/chat/ChatInput";
import ChatContent from "~/components/chat/ChatContent";

export const meta: MetaFunction = () => {
  return [
    { title: "New Chat App" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export default function Index() {
  return (
    <div className="max-w-screen-md md:mx-auto mx-6">
      <ChatContent />
      <ChatInput />
    </div>
  );
}
