import axios from "axios";
import { getHeaders, normalizeResponse } from "./client";

export async function fetchDepartments() {
  try {
    const { data } = await axios.get("https://messaging.g1.datacrazy.io/api/messaging/departments?take=10&skip=0&url=%2Fdepartments", {
      headers: getHeaders(),
      timeout: 15000,
    });
    return normalizeResponse(data);
  } catch (error) {
    console.error("[Departments] Error fetching departments from messaging API:", error);
    // Return standard fallback if offline
    return {
      count: 3,
      data: [
        {
          id: "6a5c2ecba547652405c67b0e",
          name: "Atendimento",
          color: "#EA580C",
          main: true,
        },
        {
          id: "6a6cbce0d97edaaf109fd343",
          name: "Value Promotora",
          color: "#10B981",
          main: false,
        },
        {
          id: "6a6d00427006365c0797014d",
          name: "Next",
          color: "#3B82F6",
          main: false,
        },
      ],
    };
  }
}
