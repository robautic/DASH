import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useDashboard() {
  const tq = trpc.dashboard.full.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 3,
    retryDelay: 2000,
  });
  
  const authQuery = trpc.auth.me.useQuery();
  const user = authQuery.data;

  const [realtimeLeads, setRealtimeLeads] = useState<any[] | null>(null);

  useEffect(() => {
    // Escuta em tempo real da coleção "leads"
    const q = query(collection(db, "leads"), limit(300));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leads: any[] = [];
      snapshot.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() });
      });
      // Sort desc by dataCriacao
      leads.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
      setRealtimeLeads(leads);
    }, (error) => {
      console.error("Firestore leads snapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Merge realtime leads with the dashboard data
  const data = tq.data ? { ...tq.data } : undefined;
  
  if (data && realtimeLeads && user) {
    if (user.role === "admin") {
      data.leads = realtimeLeads;
    } else {
      data.leads = realtimeLeads.filter(
        (l: any) => l.atendente === user.name || l.agent === user.name || l.atendente === user.email
      );
    }
  }

  return {
    data,
    isLoading: tq.isLoading,
    isError: tq.isError,
    error: tq.error,
    refetch: tq.refetch,
  };
}
