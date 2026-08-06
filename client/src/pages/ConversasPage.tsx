import { useConversations } from "@/hooks/useConversations";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ConversationsList } from "@/components/conversations/ConversationsList";
import { Loader2 } from "lucide-react";

export function ConversasPage() {
  const { conversations, isLoading, refetch } = useConversations(0, 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-glow animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-enter">
      <DashboardHeader
        title="Conversas em Tempo Real"
        subtitle="Monitore o atendimento, tempo de espera e histórico de mensagens com os leads"
        onRefresh={refetch}
      />
      <ConversationsList conversations={conversations} />
    </div>
  );
}
