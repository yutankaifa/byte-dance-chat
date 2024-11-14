import { FileInfoInter } from "~/utils/fileToText";

type role = "user" | "assistant" | "system" | "tool";
export interface MessageInter {
  role: role;
  content: string;
  files?: FileInfoInter[];
  images?: string[];
}
