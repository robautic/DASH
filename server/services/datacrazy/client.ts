import axios from "axios";

const BASE_URL = process.env.DATACRAZY_BASE_URL || "https://api.g1.datacrazy.io";

export function getHeaders() {
  const token = process.env.DATACRAZY_API_TOKEN?.trim() || "";
  const tenantId = process.env.DATACRAZY_TENANT_ID || "";
  const userId = process.env.DATACRAZY_USER_ID || "";
  const userEmail = process.env.DATACRAZY_USER_EMAIL || "";
  const signature = process.env.DATACRAZY_SIGNATURE || "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-timezone": "America/Sao_Paulo",
    "x-hostname": "https://crm.datacrazy.io",
    "x-language": "pt",
    "x-dz-include-totals": "true",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (tenantId) headers["x-dz-tenantid"] = tenantId;
  if (userId) headers["x-user-id"] = userId;
  if (userEmail) headers["x-user-email"] = userEmail;
  if (signature) headers["x-signature"] = signature;

  return headers;
}

/**
 * Normalize API response to always return { count, data }
 */
export function normalizeResponse(response: any) {
  if (!response) return { count: 0, data: [] };
  const data = Array.isArray(response) ? response : response.data || [];
  const count = response.count ?? response.total ?? data.length;
  return { count, data };
}

export const dataCrazyClient = axios.create({
  baseURL: BASE_URL,
  timeout: 25000,
});

// Request Queue Throttle to prevent hitting 429
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 250; // 250ms spacing between requests

dataCrazyClient.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();

  const headers = getHeaders();
  Object.entries(headers).forEach(([k, v]) => {
    config.headers.set(k, v);
  });
  return config;
});

dataCrazyClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    const retryCount = config.__retryCount || 0;
    const is429 = error.response?.status === 429;
    const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");

    if (is429 && retryCount < 5) {
      config.__retryCount = retryCount + 1;
      const retryAfterHeader = error.response.headers["retry-after"];
      const delayMs = retryAfterHeader
        ? parseInt(retryAfterHeader, 10) * 1000
        : Math.pow(2, retryCount) * 3000 + Math.random() * 500;
      console.warn(`[DataCrazy API Throttle] 429 Rate limited. Cooling down (${config.__retryCount}/5) for ${Math.round(delayMs)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return dataCrazyClient(config);
    }

    if (isTimeout && retryCount < 2) {
      config.__retryCount = retryCount + 1;
      console.warn(`[DataCrazy API Timeout] Request timed out. Retrying (${config.__retryCount}/2)...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return dataCrazyClient(config);
    }
    
    return Promise.reject(error);
  }
);
