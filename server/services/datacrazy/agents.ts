import { dataCrazyClient, normalizeResponse } from "./client";

export async function fetchAttendants() {
  try {
    const { data } = await dataCrazyClient.get("/api/v1/attendants/crm");
    return normalizeResponse(data);
  } catch (error: any) {
    console.warn("[Attendants] Failed to fetch attendants:", error?.response?.status || error?.message || error);
    return { count: 0, data: [] };
  }
}

export async function fetchInstances() {
  try {
    const { data } = await dataCrazyClient.get("/api/v1/instances");
    return normalizeResponse(data);
  } catch (error: any) {
    console.warn("[Instances] Failed to fetch instances:", error?.response?.status || error?.message || error);
    return { count: 0, data: [] };
  }
}
