import { MessageApiInter } from "~/types";

export const auth_key =
  "pat_bOIFZy7Xv3B630kYQAlG8gTkyy1a6IXkPmHgHz3vytYmNNA240sD7AIlsGbXiLla";
export const bot_id = "7437535058480955442";

export const asyncChat = async (messages: MessageApiInter[]) => {
  return await fetch("/api/v3/chat", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + auth_key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bot_id,
      user_id: "1111",
      stream: true,
      auto_save_history: true,
      additional_messages: messages,
    }),
  });
};
export const asyncFileUpload = async (file: any) => {
  const form_data = new FormData();
  form_data.append("file", file);
  const res = await fetch("/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + auth_key,
      content_type: "multipart/form-data",
    },
    body: form_data,
  });
  return await res.json();
};

export const asyncCreateConversation = async (messages: MessageApiInter[]) => {
  const res = await fetch("/api/v1/conversation/create", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + auth_key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  });
  return await res.json();
};
