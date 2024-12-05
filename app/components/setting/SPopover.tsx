import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function SPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Bot ID</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="break-words">
          Enter the development page of the bot, the number after the bot
          parameter in the development page URL is the bot ID. For example,
          https://www.coze.cn/space/341****/bot/73428668*****，bot_id is
          73428668*****。
        </p>
        <p>
          Ensure the bot is published as an API service. For details, refer to{" "}
          <a
            target="_blank"
            rel="noreferrer"
            className="text-blue-500"
            href="https://www.coze.cn/docs/developer_guides/preparation"
          >
            Preparation
          </a>
          .
        </p>
      </PopoverContent>
    </Popover>
  );
}
