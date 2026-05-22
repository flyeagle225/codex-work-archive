import { readFile } from "node:fs/promises";

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Feishu returned non-JSON response (${response.status}): ${text}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function requestMultipartJson(url, { headers = {}, form }) {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: form,
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Feishu returned non-JSON response (${response.status}): ${text}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

function requireEnv(names) {
  for (const name of names) {
    if (!process.env[name] || !process.env[name].trim()) {
      throw new Error(`Missing config: ${name}`);
    }
  }
}

async function getTenantAccessToken() {
  requireEnv(["FEISHU_APP_ID", "FEISHU_APP_SECRET"]);
  const data = await requestJson(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      body: JSON.stringify({
        app_id: process.env.FEISHU_APP_ID,
        app_secret: process.env.FEISHU_APP_SECRET,
      }),
    },
  );
  if (data.code !== 0) {
    throw new Error(`Failed to get tenant access token: ${data.msg}`);
  }
  return data.tenant_access_token;
}

export async function feishuApiJson(path, options = {}) {
  const token = await getTenantAccessToken();
  return requestJson(`https://open.feishu.cn${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

export async function sendTextMessage({ receiveIdType, receiveId, text }) {
  const token = await getTenantAccessToken();
  const data = await requestJson(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${encodeURIComponent(receiveIdType)}`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        receive_id: receiveId,
        msg_type: "text",
        content: JSON.stringify({ text }),
      }),
    },
  );
  if (data.code !== 0) {
    throw new Error(`Failed to send message: ${data.msg}`);
  }
  return data.data?.message_id ?? null;
}

export async function uploadImFile({ filePath, fileName, mimeType = "text/markdown" }) {
  const token = await getTenantAccessToken();
  const bytes = await readFile(filePath);
  const form = new FormData();
  form.append("file_type", "stream");
  form.append("file_name", fileName);
  form.append("file", new Blob([bytes], { type: mimeType }), fileName);

  const data = await requestMultipartJson("https://open.feishu.cn/open-apis/im/v1/files", {
    headers: { authorization: `Bearer ${token}` },
    form,
  });
  if (data.code !== 0) {
    throw new Error(`Failed to upload Feishu file: ${data.msg}`);
  }
  return data.data?.file_key;
}

export async function sendFileMessage({ receiveIdType, receiveId, fileKey }) {
  const token = await getTenantAccessToken();
  const data = await requestJson(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${encodeURIComponent(receiveIdType)}`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        receive_id: receiveId,
        msg_type: "file",
        content: JSON.stringify({ file_key: fileKey }),
      }),
    },
  );
  if (data.code !== 0) {
    throw new Error(`Failed to send file message: ${data.msg}`);
  }
  return data.data?.message_id ?? null;
}

export { requestJson, requireEnv };
