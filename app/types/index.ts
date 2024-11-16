export type object_string_type = "text" | "file" | "image";
export type content_type = "object_string" | "text";
type role = "user" | "assistant";

export type ChatContentType = {
  type: "inline" | "page";
};

export interface FileInfoInter {
  file_id?: string;
  file_url?: string;
  name: string;
  base64?: string;
}
export interface MessageInter {
  role: role;
  text: string;
  files?: FileInfoInter[];
  images?: FileInfoInter[];
}
export interface MessageApiInter {
  role: role;
  content: string;
  content_type: content_type;
}
