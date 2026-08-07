import { trpc } from "@/lib/trpc";

export function useLeads(skip = 0, take = 100, search?: string, status?: string) {
  const query = trpc.leads.list.useQuery(
    { skip, take, search, status },
    {
      staleTime: 30_000,
      refetchInterval: 30_000,
    }
  );

  return {
    leads: query.data?.data || [],
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useLeadDetail(id?: string) {
  const query = trpc.leads.getById.useQuery(
    { id: id || "" },
    {
      enabled: Boolean(id),
    }
  );

  return {
    lead: query.data,
    isLoading: query.isLoading,
  };
}

export function useUpdateLead() {
  const utils = trpc.useUtils();
  return trpc.leads.update.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.dashboard.full.invalidate();
      utils.dashboard.leads.invalidate();
      utils.leads.getById.invalidate();
    },
  });
}
