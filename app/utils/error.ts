export class ChatError extends Error {
  constructor(message: string) {
    super(message);
  }

  static fromError(error: unknown): ChatError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage === "Failed to fetch") {
      return new ChatError("Network connection error, please check your network settings and try again");
    } else if (errorMessage === "signal is aborted without reason") {
      return new ChatError("Reply canceled");
    } else if (error instanceof ChatError) {
      return error;
    }

    return new ChatError(errorMessage);
  }
}
