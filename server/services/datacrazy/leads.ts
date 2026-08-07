import { dataCrazyClient, normalizeResponse } from "./client";

export async function fetchLeads(skip = 0, take = 100, filters?: Record<string, string>) {
  try {
    const params: Record<string, any> = { skip, take };
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params[`filter[${key}]`] = value;
      }
    }
    const { data } = await dataCrazyClient.get("/api/v1/leads", { params });
    return normalizeResponse(data);
  } catch (error: any) {
    console.warn("[Leads] fetchLeads error:", error?.message || error);
    return { count: 0, data: [] };
  }
}

export async function fetchAllLeads(filters?: Record<string, string>, maxPages = 30) {
  let all: any[] = [];
  let skip = 0;
  const take = 100;
  let hasMore = true;
  let page = 0;
  let totalCount = 0;

  while (hasMore && page < maxPages) {
    const params: Record<string, any> = { skip, take };
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params[`filter[${key}]`] = value;
      }
    }
    try {
      const { data } = await dataCrazyClient.get("/api/v1/leads", { params });
      const normalized = normalizeResponse(data);
      const pageData = normalized.data || [];
      totalCount = normalized.count || totalCount;
      all = all.concat(pageData);

      if (pageData.length < take || (totalCount > 0 && all.length >= totalCount)) {
        hasMore = false;
      } else {
        skip += take;
        page++;
        await new Promise((r) => setTimeout(r, 150));
      }
    } catch (err: any) {
      console.warn(`[DataCrazy] fetchAllLeads page ${page} warning/error:`, err?.message || err);
      hasMore = false;
    }
  }

  return { count: totalCount || all.length, data: all };
}

export async function fetchLeadById(id: string) {
  try {
    const { data } = await dataCrazyClient.get(`/api/v1/leads/${id}`);
    return data;
  } catch (error: any) {
    console.warn("[Leads] fetchLeadById error:", error?.message || error);
    return null;
  }
}

export async function fetchBusinesses(skip = 0, take = 100, filters?: Record<string, string>) {
  try {
    const params: Record<string, any> = { skip, take };
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params[`filter[${key}]`] = value;
      }
    }
    const { data } = await dataCrazyClient.get("/api/v1/businesses", { params });
    return normalizeResponse(data);
  } catch (error: any) {
    console.warn("[Businesses] fetchBusinesses error:", error?.message || error);
    return { count: 0, data: [] };
  }
}

export async function fetchAllBusinesses(filters?: Record<string, string>, maxPages = 30) {
  let all: any[] = [];
  let skip = 0;
  const take = 100;
  let hasMore = true;
  let page = 0;
  let totalCount = 0;

  while (hasMore && page < maxPages) {
    const params: Record<string, any> = { skip, take };
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params[`filter[${key}]`] = value;
      }
    }
    try {
      const { data } = await dataCrazyClient.get("/api/v1/businesses", { params });
      const normalized = normalizeResponse(data);
      const pageData = normalized.data || [];
      totalCount = normalized.count || totalCount;
      all = all.concat(pageData);

      if (pageData.length < take || (totalCount > 0 && all.length >= totalCount)) {
        hasMore = false;
      } else {
        skip += take;
        page++;
        await new Promise((r) => setTimeout(r, 150));
      }
    } catch (err: any) {
      console.warn(`[DataCrazy] fetchAllBusinesses page ${page} warning/error:`, err?.message || err);
      hasMore = false;
    }
  }

  return { count: totalCount || all.length, data: all };
}

export async function fetchPipelines() {
  try {
    const { data } = await dataCrazyClient.get("/api/v1/pipelines", { params: { skip: 0, take: 50 } });
    return normalizeResponse(data);
  } catch (error: any) {
    console.warn("[Pipelines] fetchPipelines error:", error?.message || error);
    return { count: 0, data: [] };
  }
}

export async function fetchPipelineStages(pipelineId: string) {
  try {
    const { data } = await dataCrazyClient.get(`/api/v1/pipelines/${pipelineId}/stages`);
    return normalizeResponse(data);
  } catch (error: any) {
    console.warn("[Pipelines] fetchPipelineStages error:", error?.message || error);
    return { count: 0, data: [] };
  }
}
