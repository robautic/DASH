import { dataCrazyClient, normalizeResponse } from "./client";

export async function fetchConversations(skip = 0, take = 50, filters?: Record<string, string>) {
  const params: Record<string, any> = { skip, take };
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      params[`filter[${key}]`] = value;
    }
  }
  const { data } = await dataCrazyClient.get("/api/v1/conversations", { params });
  return normalizeResponse(data);
}

export async function fetchAllConversations(filters?: Record<string, string>, maxPages = 10) {
  let all: any[] = [];
  let skip = 0;
  const take = 1000;
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
      const { data } = await dataCrazyClient.get("/api/v1/conversations", { params });
      const normalized = normalizeResponse(data);
      const pageData = normalized.data || [];
      totalCount = normalized.count || totalCount;
      all = all.concat(pageData);

      if (pageData.length < take || (totalCount > 0 && all.length >= totalCount)) {
        hasMore = false;
      } else {
        skip += take;
        page++;
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (err: any) {
      console.warn(`[DataCrazy] fetchAllConversations page ${page} warning/error:`, err?.message || err);
      hasMore = false;
    }
  }

  return { count: totalCount || all.length, data: all };
}

