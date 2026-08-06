import axios from "axios";

const BASE_URL = "https://api.g1.datacrazy.io";
const FALLBACK_TOKEN =
  process.env.DATACRAZY_API_TOKEN ||
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwY2FkODZkNzY5ZmFkZTViODkxNmQ5Y2U1MDc0YzgyMGYwNjdkNTIiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQXNzZXNzb3JpYSIsInRlbmFudElkIjoiMDQ4Yzc5OGQtNTNhNi00Nzg3LWE1NGMtMjU5MTIyOTZhYTZlIiwicm9sZXMiOlsiYWRtaW4iXSwiaXNBZG1pbiI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2RhdGFjcmF6eS12Mi1wcm9kIiwiYXVkIjoiZGF0YWNyYXp5LXYyLXByb2QiLCJhdXRoX3RpbWUiOjE3ODYwNTA3NDMsInVzZXJfaWQiOiJXMlNpbE4yUUJLZndXVG9tSTVMSFp1cE84NzcyIiwic3ViIjoiVzJTaWxOMlFCS2Z3V1RvbUk1TEhadXBPODc3MiIsImlhdCI6MTc4NjA1NjE2MywiZXhwIjoxNzg2MDU5NzYzLCJlbWFpbCI6ImFzc2Vzc29yaWFzaWdtYTI2QGdtYWlsLmNvbSJ9.yMkBBfQkV9jlcF66G5oJrFKTrIXsnu9ilCDeNl7xRDZzJjtrB9DP6_VtSKIXmnnJ9-yg7Nsz5YSjAx4HghWkq1GS0aCPdApTq9G8WKtLzqjKNLa2nN9Hv09PupLnk3vFuZHAhziJViWO4pd9MEq4_7G-WTGG2na_73D2y5K6ah-XpE0edzCMY_MOc-es9rkiFNQjwtDnYTxgHIT-GKkxqW6EkKlFfIlY5_NZO82OlS1F4rSVtmfCCNQkk2uFjl2u6GsttgZjBH8UlHk6wjqfcxLeigIHcnlKWrp3ynnqpSCJ1ObzS7gg4HVGDky9rbHPsO4pp9UYJnzEJYDUknM7mQ";

export function getHeaders() {
  const token = process.env.DATACRAZY_API_TOKEN || FALLBACK_TOKEN;
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
  timeout: 15000,
});

dataCrazyClient.interceptors.request.use((config) => {
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
      const delayMs = retryAfterHeader
        ? parseInt(retryAfterHeader, 10) * 1000
        : Math.pow(2, retryCount) * 1200 + Math.random() * 500;
      console.warn(`[DataCrazy API] 429 Rate limited. Retrying request (${config.__retryCount}/5) in ${Math.round(delayMs)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return dataCrazyClient(config);
    }
    return Promise.reject(error);
  }
);
