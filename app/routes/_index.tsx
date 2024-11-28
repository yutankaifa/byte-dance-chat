import type { MetaFunction } from "@remix-run/node";
import ChatInput from "~/components/chat/ChatInput";
import ChatContent from "~/components/chat/ChatContent";
import ChatDialog from "~/components/chat/ChatDialog";
import { getData } from "~/.server/inedx";
import ChatSetting from "~/components/chat/ChatSetting";

export const loader = async () => {
  const res = await getData();
  return Response.json({ res });
};

export const meta: MetaFunction = () => {
  return [
    { title: "New Chat App" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export default function Index() {
  return (
    <div className="max-w-screen-md h-screen overflow-hidden md:mx-auto mx-3">
      <div className="flex justify-between">
        <ChatSetting />
        <ChatDialog />
      </div>
      <div
        className="flex flex-col w-full"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <ChatContent key={"page-content"} type={"page"} />
        <ChatInput key={"page-input"} type={"page"} />
      </div>
    </div>
  );
}
