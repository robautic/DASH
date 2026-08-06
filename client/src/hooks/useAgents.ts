import { trpc } from "@/lib/trpc";

export function useAgents() {
  const query = trpc.agents.list.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const performanceQuery = trpc.agents.performance.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return {
    agents: query.data || [],
    performance: performanceQuery.data || [],
    isLoading: query.isLoading || performanceQuery.isLoading,
    refetch: () => {
      query.refetch();
      performanceQuery.refetch();
    },
  };
}
