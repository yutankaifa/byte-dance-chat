import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function SPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">智能体ID</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="break-words">
          进入智能体的开发页面，开发页面 URL 中 bot
          参数后的数字就是智能体ID。例如https://www.coze.cn/space/341****/bot/73428668*****，bot_id
          为73428668*****。
        </p>
        <p>
          确保智能体已发布为 API 服务。详情参考{" "}
          <a
            target="_blank"
            rel="noreferrer"
            className="text-blue-500"
            href="https://www.coze.cn/docs/developer_guides/preparation"
          >
            准备工作
          </a>
          。
        </p>
      </PopoverContent>
    </Popover>
  );
}
