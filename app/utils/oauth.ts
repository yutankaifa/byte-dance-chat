import CryptoJS from 'crypto-js';
import { setStorageSetting, getStorageSetting } from './storage';
// 生成一个随机的 code_verifier
function generateCodeVerifier(length = 64) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let codeVerifier = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    codeVerifier += charset[randomIndex];
  }
  return codeVerifier;
}

// 生成 code_challenge
export function generateCodeChallenge() {
  const codeVerifier = generateCodeVerifier();
  setStorageSetting({
    ...getStorageSetting(),
    code_verifier: codeVerifier,
  });
  // 使用 CryptoJS 进行 SHA-256 哈希计算
  const hash = CryptoJS.SHA256(codeVerifier);

  // 将结果转换为 Base64 编码
  const base64 = CryptoJS.enc.Base64.stringify(hash);
  
  // 转换为 Base64URL 编码（替换 + 为 -，/ 为 _，去掉 = 填充）
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function getToken() {
  const auth_type = getStorageSetting()?.auth_type;
  return auth_type === "one" ? getStorageSetting()?.token : getStorageSetting()?.access_token;
}

export function getBotId() {
  const auth_type = getStorageSetting()?.auth_type;
  return auth_type === "one" ? getStorageSetting()?.bot_id : getStorageSetting()?.bot_id2;
}

