import { dataCrazyClient, normalizeResponse } from "./client";

export async function fetchAttendants() {
  const { data } = await dataCrazyClient.get("/api/v1/attendants/crm");
  return normalizeResponse(data);
}

export async function fetchInstances() {
  const { data } = await dataCrazyClient.get("/api/v1/instances");
  return normalizeResponse(data);
}
