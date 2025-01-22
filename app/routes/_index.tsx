import type { MetaFunction } from "@remix-run/node";
import ChatInput from "~/components/chat/ChatInput";
import ChatContent from "~/components/chat/ChatContent";
import ChatDialog from "~/components/chat/ChatDialog";
import ChatSetting from "~/components/chat/ChatSetting";
import { asyncOAuthToken } from "~/apis/data";
import { useEffect } from "react";
import { getStorageSetting, updateTwoToken } from "~/utils/storage";
import { toast } from "sonner";
import { ChatError } from "~/utils/error";
import { ThemeMode } from "~/types";
import { applyThemeMode } from "~/utils/color-scheme";

export const meta: MetaFunction = () => {
  return [
    { title: "New Chat App" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export default function Index() {
  useEffect(() => {
    applyThemeMode(ThemeMode.Auto);
    const code = new URLSearchParams(window.location.search).get("code");
    const init = async () => {
      try {
        if (code) {
          const res = await asyncOAuthToken(
            code,
            getStorageSetting()?.code_verifier
          );
          const data = await res.json();
          if (data.access_token) {
            updateTwoToken(data.access_token, data.refresh_token);
            toast.success("Authorization successful");
            window.location.href = "/";
          } else throw new Error(data.error_message);
        }
      } catch (error) {
        console.log("error", error);
        const err = ChatError.fromError(error);
        toast.error(err.message);
      }
    };
    init();
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
