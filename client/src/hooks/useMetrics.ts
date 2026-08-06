import { trpc } from "@/lib/trpc";

export function useMetrics() {
  const query = trpc.metrics.overview.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return {
    metrics: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
