import { MessageApiInter, ResponseRetrieveInter } from "~/types";
import { getStorageSetting } from "~/utils/storage";

export const bot_id = "7437535058480955442";
export const proxy_url = "http://175.178.3.60:8881/api";
export const asyncChat = async (
  messages: MessageApiInter[],
  abort: AbortController
) => {
  return await fetch(`${proxy_url}/v3/chat`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getStorageSetting()?.token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bot_id,
      user_id: "1111",
      stream: getStorageSetting()?.stream,
      auto_save_history: true,
      additional_messages: messages,
    }),
    signal: abort.signal,
  });
};
export const asyncFileUpload = async (file: File) => {
  try {
    const form_data = new FormData();
    form_data.append("file", file);
    const res = await fetch(`${proxy_url}/v1/files/upload`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getStorageSetting()?.token,
        content_type: "multipart/form-data",
      },
      body: form_data,
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
};
export const asyncRetrievePolling = async (
  conversation_id: string,
  chat_id: string
): Promise<ResponseRetrieveInter> => {
  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `${proxy_url}/v3/chat/retrieve?conversation_id=${conversation_id}&chat_id=${chat_id}`,
          {
            headers: {
              Authorization: "Bearer " + getStorageSetting()?.token,
            },
          }
        );
        const jsonData = await res.json();
        console.log("jsonData", jsonData);

        if (jsonData.data.status === "completed") {
          clearInterval(timer);
          const messageDetail = await (
            await asyncMessageDetail(conversation_id, chat_id)
          ).json();
          resolve(messageDetail);
        } else if (jsonData.data.status !== "in_progress") {
          clearInterval(timer);
          reject(jsonData.msg || "请求失败");
        }
      } catch (error) {
        clearInterval(timer);
        reject(error);
      }
    }, 2000);
  });
};
export const asyncMessageDetail = async (
  conversation_id: string,
  chat_id: string
) => {
  return await fetch(
    `${proxy_url}/v3/chat/message/list?conversation_id=${conversation_id}&chat_id=${chat_id}`,
    {
      headers: {
        Authorization: "Bearer " + getStorageSetting()?.token,
      },
    }
  );
};
