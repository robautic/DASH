import { getCache, setCache } from "../cache";

export function getCachedAgents<T>(key = "agents_full"): T | null {
  return getCache<T>(key);
}

export function setCachedAgents<T>(data: T, key = "agents_full"): void {
  setCache<T>(key, data);
}
