import { trpc } from "@/lib/trpc";

export function useDashboard() {
  const query = trpc.dashboard.full.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 3,
    retryDelay: 2000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
