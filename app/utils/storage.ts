import { SettingInter } from "~/types";

const setting_key = "setting";

export const getStorageSetting = () => {
  const setting = localStorage.getItem(setting_key);
  return setting ? JSON.parse(setting) : null;
};

export const setStorageSetting = (setting: SettingInter | undefined) => {
  localStorage.setItem(setting_key, JSON.stringify(setting));
};
