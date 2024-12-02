export type object_string_type = "text" | "file" | "image";
export type content_type = "object_string" | "text";
export type message_type =
  | "answer"
  | "function_call"
  | "tool_response"
  | "verbose"
  | "follow_up";
type role = "user" | "assistant";
export type ResponseMessageType = {
  created_at?: string;
  type: message_type;
  content: string;
  status?: "failed" | "in_progress" | "created";
  last_error?: {
    msg: string;
  };
};
export type ChatContentType = {
  type: "inline" | "page";
};

export interface FileInfoInter {
  file: File;
  file_id?: string;
  file_url?: string;
  name: string;
  base64?: string;
  status?: "uploading" | "uploaded" | "failed";
}
export interface MessageInter {
  role: role;
  text: string;
  suggestions?: string[];
  files?: FileInfoInter[];
  images?: FileInfoInter[];
  error?: string;
}
export interface MessageApiInter {
  role: role;
  content: string;
  content_type: content_type;
}
export interface SettingInter {
  bot_id?: string;
  bot_id2?: string;
  client_id?: string;
  token?: string;
  refresh_token?: string;
  access_token?: string;
  stream?: boolean;
  code_verifier?: string;
  auth_type?: "one" | "two";
  custom_url?: string;
}
export interface ResponseMessageInter {
  type: message_type;
  content: string;
}
export interface ResponseRetrieveInter {
  code: number;
  data: ResponseMessageInter[];
  msg: string;
}
