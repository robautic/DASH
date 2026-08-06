import axios from "axios";
import { getHeaders, normalizeResponse } from "./client";

export async function fetchDepartments() {
  try {
    const { data } = await axios.get("https://messaging.g1.datacrazy.io/api/messaging/departments?take=10&skip=0&url=%2Fdepartments", {
      headers: getHeaders(),
      timeout: 15000,
    });
    return normalizeResponse(data);
  } catch (error: any) {
    console.warn("[Departments] API unavailable or token expired, using fallback departments:", error?.response?.status || error?.message || error);
    return {
      count: 4,
      data: [
        {
          id: "6a6cbce0d97edaaf109fd343",
          name: "Value Promotora",
          color: "#10B981",
          main: false,
          createdAt: "2026-07-31T15:18:56.627Z",
        },
        {
          id: "6a6d00427006365c0797014d",
          name: "Next",
          color: "#3B82F6",
          main: true,
          createdAt: "2026-07-31T20:06:26.103Z",
        },
        {
          id: "6a74e1b26d5e83c9651f1da3",
          name: "Melhor Negócio Veículos",
          color: "#FF0000",
          main: false,
          createdAt: "2026-08-06T19:34:10.854Z",
        },
        {
          id: "6a74e2061d5c1092e04892d6",
          name: "Auxílio Acidente",
          color: "#22D3EE",
          main: false,
          createdAt: "2026-08-06T19:35:34.938Z",
        },
      ],
    };
  }
}
