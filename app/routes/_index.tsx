import type { MetaFunction } from "@remix-run/node";
import ChatInput from "~/components/chat/ChatInput";
import ChatContent from "~/components/chat/ChatContent";
import ChatDialog from "~/components/chat/ChatDialog";
import ChatSetting from "~/components/chat/ChatSetting";
import { asyncOAuthToken } from "~/apis/data";
import { useEffect } from "react";
import { getStorageSetting, setStorageSetting } from "~/utils/storage";
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
          console.log(res);
          if (res.ok) {
          const data = await res.json();
          console.log(data);
          setStorageSetting({
            ...getStorageSetting(),
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
          window.location.href = "/";
        } else {
          toast.error("授权失败");
        }
      });
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
