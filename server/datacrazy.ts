import axios from "axios";

const BASE_URL = "https://api.g1.datacrazy.io";

function getHeaders() {
  const token = process.env.DATACRAZY_API_TOKEN;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Normalize API response to always return { count, data }
 * Some endpoints return { data: [] }, others return { count, data: [] }
 */
function normalizeResponse(response: any) {
  if (!response) return { count: 0, data: [] };
  const data = Array.isArray(response) ? response : response.data || [];
  const count = response.count ?? response.total ?? data.length;
  return { count, data };
}

export async function fetchAttendants() {
  const { data } = await axios.get(`${BASE_URL}/api/v1/attendants/crm`, {
    headers: getHeaders(),
    timeout: 15000,
  });
  // attendants endpoint returns { data: [...] } directly
  return normalizeResponse(data);
}

export async function fetchLeads(skip = 0, take = 100, filters?: Record<string, string>) {
  const params: Record<string, any> = { skip, take };
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      params[`filter[${key}]`] = value;
    }
  }
  const { data } = await axios.get(`${BASE_URL}/api/v1/leads`, {
    headers: getHeaders(),
    params,
    timeout: 15000,
  });
  return normalizeResponse(data);
}

export async function fetchInstances() {
  const { data } = await axios.get(`${BASE_URL}/api/v1/instances`, {
    headers: getHeaders(),
    timeout: 15000,
  });
  return normalizeResponse(data);
}

export async function fetchBusinesses(skip = 0, take = 100, filters?: Record<string, string>) {
  const params: Record<string, any> = { skip, take };
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      params[`filter[${key}]`] = value;
    }
  }
  const { data } = await axios.get(`${BASE_URL}/api/v1/businesses`, {
    headers: getHeaders(),
    params,
    timeout: 15000,
  });
  return normalizeResponse(data);
}

export async function fetchPipelines() {
  const { data } = await axios.get(`${BASE_URL}/api/v1/pipelines`, {
    headers: getHeaders(),
    params: { skip: 0, take: 50 },
    timeout: 15000,
  });
  return normalizeResponse(data);
}

export async function fetchPipelineStages(pipelineId: string) {
  const { data } = await axios.get(
    `${BASE_URL}/api/v1/pipelines/${pipelineId}/stages`,
    {
      headers: getHeaders(),
      timeout: 15000,
    }
  );
  return normalizeResponse(data);
}

export async function fetchConversations(skip = 0, take = 50, filters?: Record<string, string>) {
  const params: Record<string, any> = { skip, take };
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      params[`filter[${key}]`] = value;
    }
  }
  const { data } = await axios.get(`${BASE_URL}/api/v1/conversations`, {
    headers: getHeaders(),
    params,
    timeout: 15000,
  });
  return normalizeResponse(data);
}

export async function fetchLead(id: string) {
  const { data } = await axios.get(`${BASE_URL}/api/v1/leads/${id}`, {
    headers: getHeaders(),
    timeout: 15000,
  });
  return data;
}
