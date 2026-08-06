import { trpc } from "@/lib/trpc";

export function useConversations(skip = 0, take = 50) {
  const query = trpc.conversations.list.useQuery(
    { skip, take },
    {
      staleTime: 30_000,
      refetchInterval: 30_000,
    }
  );

  return {
    conversations: query.data?.data || [],
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
