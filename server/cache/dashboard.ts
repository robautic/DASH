import { getCache, setCache } from "../cache";

export function getCachedDashboardData<T>(key = "dashboard_full"): T | null {
  return getCache<T>(key);
}

export function setCachedDashboardData<T>(data: T, key = "dashboard_full"): void {
  setCache<T>(key, data);
}
