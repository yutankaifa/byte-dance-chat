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
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { generateCodeChallenge } from "~/utils/oauth";
import { asyncOAuth } from "~/apis/data";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export default function ChatSetting() {
  const [setting, setSetting] = useState<SettingInter>();

  useEffect(() => {
    const setting = getStorageSetting();
    if (!setting?.auth_type) {
      const initSetting: SettingInter = {
        auth_type: "one",
        stream: true,
      };
      setSetting(initSetting);
      setStorageSetting(initSetting);
    } else setSetting(setting);
  }, []);
  const saveSetting = () => {
    setStorageSetting(setting);
    toast.success("保存成功");
  };
  const handleOAuth = async () => {
    const codeChallenge = await generateCodeChallenge();
    console.log(codeChallenge);
    const res = await asyncOAuth(codeChallenge);
    console.log(res);
  };
  useEffect(() => {
    if (setting) {
      setStorageSetting(setting);
    }
  }, [setting]);
  return (
    <div className="flex items-center">
      <Dialog>
        <DialogTrigger aria-label="设置" style={{ height: "30px" }}>
          <Cog6ToothIcon width={30} />
        </DialogTrigger>
        <DialogContent className="min-h-[200px] max-w-screen-md rounded-2xl flex flex-col">
          <DialogTitle className="hidden"></DialogTitle>
          <div className="flex flex-col gap-3 flex-1">
            <RadioGroup
              value={setting?.auth_type}
              onValueChange={(value) => {
                console.log(value);
                setSetting({ ...setting, auth_type: value as "one" | "two" });
              }}
              defaultValue={setting?.auth_type}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one" /> <p>方式一：需要提供</p>
                <em>Coze访问令牌</em> <span>和</span> <em>智能体ID</em> <br />
                <p>了解更多细节请跳转至</p>
                <a
                  href="https://www.coze.cn/docs/developer_guides/preparation"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500"
                >
                  coze 个人令牌
                </a>
              </div>
              <p className="text-sm text-gray-500">
                注：该令牌只会保存到本地，不会上传到服务器
              </p>
              <Input
                value={setting?.token}
                onChange={(e) =>
                  setSetting({ ...setting, token: e.target.value })
                }
                width={300}
                placeholder="token..."
              />

              <Input
                value={setting?.bot_id}
                onChange={(e) =>
                  setSetting({ ...setting, bot_id: e.target.value })
                }
                width={300}
                placeholder="智能体ID..."
              />

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="two" />
                <p>方式二：</p>
                <Button onClick={handleOAuth}>授权</Button>
                <p>即可进行对话</p>
              </div>
            </RadioGroup>

            <div className="flex items-center space-x-2">
              <label htmlFor="stream">是否启用流式输出</label>
              <Switch
                id="stream"
                checked={setting?.stream}
                onCheckedChange={(e) => setSetting({ ...setting, stream: e })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveSetting}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
