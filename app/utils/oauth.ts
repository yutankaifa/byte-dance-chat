import { getStorageSetting } from "./storage";

import { setStorageSetting } from "./storage";

// 生成随机的 code_verifier（长度43-128字符）
function generateCodeVerifier(length = 64) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let codeVerifier = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      codeVerifier += charset[randomIndex];
    }
    return codeVerifier;
  }

    
  // 将 ArrayBuffer 转换为 Base64URL 编码
  function bufferToBase64Url(buffer: ArrayBuffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    const base64 = btoa(binary);
  
    // 将标准 Base64 编码转换为 Base64URL 编码
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

// 将 code_verifier 使用 SHA-256 计算 hash，然后 Base64URL 编码
export async function generateCodeChallenge() {
    const codeVerifier = generateCodeVerifier();
    setStorageSetting({
      ...getStorageSetting(),
    code_verifier: codeVerifier,
  });
  // 先将 code_verifier 转换为 Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  
    // 使用 SHA-256 进行哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
    // 将哈希结果转成 Base64URL 编码
    const base64UrlEncoded = bufferToBase64Url(hashBuffer);
    return base64UrlEncoded;
  }
