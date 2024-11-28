import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { SettingInter } from "~/types";
import { getStorageSetting, setStorageSetting } from "~/utils/storage";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function ChatSetting() {
  useEffect(() => {
    const setting = getStorageSetting();
    setSetting(setting);
  }, []);
  const [setting, setSetting] = useState<SettingInter>();
  const saveSetting = () => {
    setStorageSetting(setting);
    window.location.reload();
  };
  return (
    <div className="flex items-center">
      <Dialog onOpenChange={() => toast.dismiss()}>
        <DialogTrigger style={{ height: "30px" }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger aria-label="设置">
                <Cog6ToothIcon width={30} />
              </TooltipTrigger>
              <TooltipContent>
                <p>设置</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogTrigger>
        <DialogContent className="min-h-[200px] max-w-screen-md rounded-2xl flex flex-col">
          <DialogTitle className="hidden"></DialogTitle>
          <div className="flex flex-col gap-3 flex-1">
            <label htmlFor="token">Coze Secret Token</label>
            <p className="text-sm text-red-500">
              请输入正确的 token，否则将无法使用，获取 token 请访问
              <a
                href="https://www.coze.cn/open/oauth/pats"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500"
              >
                Coze 个人访问令牌
              </a>
            </p>
            <Input
              value={setting?.token}
              onChange={(e) => setSetting({ token: e.target.value })}
              width={300}
              id="token"
              placeholder="pat_bOI..."
            />
            <p className="text-sm text-gray-500">
              注：该令牌只会保存到本地，不会上传到服务器
            </p>
          </div>
          <DialogFooter>
            <Button onClick={saveSetting}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
