export class ChatError extends Error {
  constructor(message: string) {
    super(message);
  }

  static fromError(error: unknown): ChatError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage === "Failed to fetch") {
      return new ChatError("网络连接错误，请检查您的网络设置后重试");
    }

    if (error instanceof ChatError) {
      return error;
    }

    return new ChatError(errorMessage);
  }
}
