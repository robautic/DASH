import axios from "axios";

const BASE_URL = "https://api.g1.datacrazy.io";
const VALID_TOKEN =
  "dc_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNzRjOGI3MmVjNjU3YjRlZTJmOGRkZCIsInRlbmFudElkIjoiMDQ4Yzc5OGQtNTNhNi00Nzg3LWE1NGMtMjU5MTIyOTZhYTZlIiwibmFtZSI6InRlc3RlIiwicm9sZXMiOlsiYWRtaW4iXSwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzg2MDM4NDU1fQ.W8QYuQ48tnyRH0ILWuxPcnTej84i8qorJTSHNrJU_DY";

export function getHeaders() {
  const token = (process.env.DATACRAZY_API_TOKEN && process.env.DATACRAZY_API_TOKEN.trim().length > 0)
    ? process.env.DATACRAZY_API_TOKEN
    : VALID_TOKEN;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-dz-tenantid": "048c798d-53a6-4787-a54c-25912296aa6e",
    "x-user-id": "W2SilN2QBKfwWTomI5LHZupO8772",
    "x-user-email": "assessoriasigma26@gmail.com",
    "x-timezone": "America/Sao_Paulo",
    "x-hostname": "https://crm.datacrazy.io",
    "x-language": "pt",
    "x-signature": "1dd63402-56af-43a7-b9fa-83c468d3da5e",
    "x-dz-include-totals": "true",
  };
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
  timeout: 12000,
});

// Request Queue Throttle to prevent hitting 429
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 200; // 200ms spacing between requests

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
    if (error.response?.status === 429 && retryCount < 5) {
      config.__retryCount = retryCount + 1;
      const retryAfterHeader = error.response.headers["retry-after"];
      // Exponential backoff starting at 3s, 6s, 12s...
      const delayMs = retryAfterHeader
        ? parseInt(retryAfterHeader, 10) * 1000
        : Math.pow(2, retryCount) * 3000 + Math.random() * 500;
      console.warn(`[DataCrazy API Throttle] 429 Rate limited. Cooling down (${config.__retryCount}/5) for ${Math.round(delayMs)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return dataCrazyClient(config);
    }
    
    return Promise.reject(error);
  }
);
