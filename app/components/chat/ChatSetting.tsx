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
import SPopover from "../setting/SPopover";

export default function ChatSetting() {
  const [setting, setSetting] = useState<SettingInter>();

  useEffect(() => {
    const setting = getStorageSetting();
    if (!setting?.auth_type) {
      const initSetting: SettingInter = {
        auth_type: "one",
        stream: true,
        custom_url: "https://www.coze.com/",
      };
      setSetting(initSetting);
      setStorageSetting(initSetting);
    } else setSetting(setting);
  }, []);
  const saveSetting = () => {
    setStorageSetting(setting);
    toast.success("Save successfully");
  };
  const handleOAuth = async () => {
    if (!setting?.client_id || !setting?.bot_id2) {
      toast.error("Please fill in the complete client ID and bot ID");
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
        <DialogTrigger aria-label="Setting" style={{ height: "30px" }}>
          <Cog6ToothIcon width={30} />
        </DialogTrigger>
        <DialogContent className="min-h-[200px] max-w-screen-md rounded-2xl flex flex-col">
          <DialogTitle className="hidden"></DialogTitle>
          <div className="flex flex-col gap-3 flex-1 text-sm">
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
                  <RadioGroupItem value="one" />{" "}
                  <p>Personal access token: need to provide</p>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500"
                      href="https://www.coze.cn/docs/developer_guides/pat"
                    >
                      Personal access token
                    </a>
                    <span className="px-2">and</span>
                    <SPopover />
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
                  placeholder="Bot ID..."
                />
              </div>

              <div className="flex flex-col gap-2 p-2 rounded-lg border">
                <div className="flex flex-wrap items-center space-x-2">
                  <RadioGroupItem value="two" />
                  <p>OAuth PKCE access token: need to provide</p>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500"
                      href="https://www.coze.cn/docs/developer_guides/oauth_pkce"
                    >
                      Client ID
                    </a>
                    <span className="px-2">and</span>
                    <SPopover />
                  </div>
                  <span className="text-red-500">
                    Create OAUTH application, fill in the redirect URL:
                    http://175.178.3.60:3000/
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
                  placeholder="Bot ID..."
                />
                <div className="flex items-center space-x-2">
                  <p>After filling in, click</p>
                  <Button className="w-20" onClick={handleOAuth}>
                    Authorize
                  </Button>
                  <p>Get access token</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Note: The above data will only be saved locally, not uploaded
                to the server
              </p>
            </RadioGroup>

            <div className="flex items-center space-x-2">
              <label htmlFor="stream">Enable stream output</label>
              <Switch
                id="stream"
                checked={setting?.stream}
                onCheckedChange={(e) => setSetting({ ...setting, stream: e })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-red-500 text-sm">
                Custom request prefix, default using{" "}
                <em>https://www.coze.com/</em>
              </p>
              <p className="text-sm text-gray-500">
                Can fill in <em>https://www.coze.cn/</em> {""}
                But need to get the corresponding configuration data of the
                website
              </p>
              <Input
                value={setting?.custom_url}
                onChange={(e) =>
                  setSetting({ ...setting, custom_url: e.target.value })
                }
                className="w-[300px]"
                placeholder="Custom request prefix..."
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end flex-row">
            <Button className="w-20" onClick={saveSetting}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
