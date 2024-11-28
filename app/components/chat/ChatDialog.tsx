import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import ChatContent from "~/components/chat/ChatContent";
import ChatInput from "~/components/chat/ChatInput";

export default function ChatDialog() {
  return (
    <div className="my-2 flex justify-center">
      <div>
        <Dialog>
          <DialogTrigger>
            <div className="flex gap-3 p-3 rounded-2xl bg-gray-100 w-[200px] sm:w-[300px] cursor-pointer hover:opacity-70">
              <MagnifyingGlassIcon width={24} />
              <span>请搜索...</span>
            </div>
          </DialogTrigger>
          <DialogContent className="h-[500px] max-w-screen-md rounded-2xl">
            <DialogTitle className="hidden"></DialogTitle>
            <div className="h-full">
              <ChatInput key={"inline-input"} type={"inline"} />
              <ChatContent key={"inline-content"} type={"inline"} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
