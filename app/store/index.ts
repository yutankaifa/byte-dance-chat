import { create } from "zustand";
import { MessageInter } from "~/types";

interface ChatState {
  messages: MessageInter[];
  setMessages(messages: MessageInter[]): void;
  messages_inline: MessageInter[];
  setMessagesInline(messages: MessageInter[]): void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  setMessages: (messages: MessageInter[]) => set({ messages }),
  messages_inline: [],
  setMessagesInline: (messages_inline: MessageInter[]) =>
    set({ messages_inline }),
}));
