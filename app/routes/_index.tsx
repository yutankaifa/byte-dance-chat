import type { MetaFunction } from "@remix-run/node";
import ChatInput from "~/components/chat/ChatInput";
import ChatContent from "~/components/chat/ChatContent";
import ChatDialog from "~/components/chat/ChatDialog";
import ChatSetting from "~/components/chat/ChatSetting";
import { asyncOAuthToken } from "~/apis/data.client";
import { useEffect } from "react";
import { getStorageSetting, updateTwoToken } from "~/utils/storage";
import { toast } from "sonner";

export const meta: MetaFunction = () => {
  return [
    { title: "New Chat App" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export default function Index() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      asyncOAuthToken(code, getStorageSetting()?.code_verifier).then(
        async (res) => {
          if (res.ok) {
            const data = await res.json();
            updateTwoToken(data.access_token, data.refresh_token);
            toast.success("授权成功");
          } else {
            toast.error("授权失败，请重新尝试");
          }
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
      );
    }
  }, []);
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
