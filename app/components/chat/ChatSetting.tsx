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
    if (!setting?.client_id || !setting?.bot_id2) {
      toast.error("请填写完整客户端ID和智能体ID");
      return;
    }
    const codeChallenge = generateCodeChallenge();
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
              <div className="flex flex-col gap-2 p-2 rounded-lg border">
                <div className="flex flex-wrap items-center space-x-2">
                  <RadioGroupItem value="one" /> <p>个人访问令牌：需要提供</p>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500"
                      href="https://www.coze.cn/docs/developer_guides/pat"
                    >
                      个人访问令牌
                    </a>
                    <span className="px-2">和</span>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500"
                      href="https://www.coze.cn/docs/guides/quickstart"
                    >
                      智能体ID
                    </a>
                  </div>
                </div>

                <Input
                  value={setting?.token}
                  onChange={(e) =>
                    setSetting({ ...setting, token: e.target.value })
                  }
                  className="w-[300px]"
                  placeholder="token..."
                />

                <Input
                  value={setting?.bot_id}
                  onChange={(e) =>
                    setSetting({ ...setting, bot_id: e.target.value })
                  }
                  className="w-[300px]"
                  placeholder="智能体ID..."
                />
              </div>

              <div className="flex flex-col gap-2 p-2 rounded-lg border">
                <div className="flex flex-wrap items-center space-x-2">
                  <RadioGroupItem value="two" />
                  <p>OAuth PKCE 访问令牌：需要提供</p>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500"
                      href="https://www.coze.cn/docs/developer_guides/oauth_pkce"
                    >
                      客户端ID
                    </a>
                    <span className="px-2">和</span>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500"
                      href="https://www.coze.cn/docs/guides/quickstart"
                    >
                      智能体ID
                    </a>
                  </div>
                  <span className="text-red-500">
                    创建OAUTH应用填写 重定向URL：http://175.178.3.60:3000/
                  </span>
                </div>
                <Input
                  value={setting?.client_id}
                  onChange={(e) =>
                    setSetting({ ...setting, client_id: e.target.value })
                  }
                  className="w-[300px]"
                  placeholder="client_id..."
                />

                <Input
                  value={setting?.bot_id2}
                  onChange={(e) =>
                    setSetting({ ...setting, bot_id2: e.target.value })
                  }
                  className="w-[300px]"
                  placeholder="智能体ID..."
                />
                <div className="flex items-center space-x-2">
                  <p>填写完成后点击</p>
                  <Button className="w-20" onClick={handleOAuth}>
                    授权
                  </Button>
                  <p>获取访问令牌</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                注：以上数据只会保存到本地，不会上传到服务器
              </p>
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
          <DialogFooter className="flex justify-end flex-row">
            <Button className="w-20" onClick={saveSetting}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
