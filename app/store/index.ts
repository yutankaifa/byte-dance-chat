import { create } from "zustand";
import { MessageInter } from "~/types";

interface ChatState {
  messages: MessageInter[];
  setMessages(messages: MessageInter[]): void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
  ],
  setMessages: (messages: MessageInter[]) => set({ messages }),
}));
