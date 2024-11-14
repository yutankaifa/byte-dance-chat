import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isEmpty } from "lodash-es";
import { createParser } from "eventsource-parser";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function* streamAsyncIterable<T = unknown>(
  stream: ReadableStream<T>
) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
const statusTextMap = new Map([
  [400, "Bad Request"],
  [401, "Unauthorized"],
  [403, "Forbidden"],
  [429, "Too Many Requests"],
]);
export async function parseSSEResponse(
  resp: Response,
  onMessage: (message: string) => void
) {
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}));
    if (!isEmpty(error)) {
      throw new Error(JSON.stringify(error));
    }
    const statusText = resp.statusText || statusTextMap.get(resp.status) || "";
    console.log(`${resp.status} ${statusText}`);
  }
  const parser = createParser({
    onEvent: (event) => {
      if (event.data) {
        // console.log("Event data:", event.data);
        onMessage(event.data);
      }
    },
  });
  const decoder = new TextDecoder();
  for await (const chunk of streamAsyncIterable(resp.body!)) {
    const str = decoder.decode(chunk, { stream: true });
    parser.feed(str);
  }
}
