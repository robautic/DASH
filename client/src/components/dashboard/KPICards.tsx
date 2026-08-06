import KPICard from "../KPICard";
import { MessageSquare, Users, GitBranch, Zap } from "lucide-react";

interface KPICardsProps {
  totalLeads: number;
  atendentesOnline: number;
  atendentesTotal: number;
  conexoesAtivas: number;
  conexoesTotal: number;
  taxaDistribuicao: number;
}

export function KPICardsSection({
  totalLeads,
  atendentesOnline,
  atendentesTotal,
  conexoesAtivas,
  conexoesTotal,
  taxaDistribuicao,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Total de Leads"
        value={totalLeads}
        icon={MessageSquare}
        color="text-emerald-glow"
        trend={{ value: "Dados em tempo real", positive: true }}
      />
      <KPICard
        label="Atendentes Online"
        value={`${atendentesOnline}/${atendentesTotal}`}
        icon={Users}
        color="text-[oklch(0.65_0.22_250)]"
        trend={{ value: `${atendentesOnline} disponíveis`, positive: true }}
      />
      <KPICard
        label="Conexões Ativas"
        value={`${conexoesAtivas}/${conexoesTotal}`}
        icon={GitBranch}
        color="text-[oklch(0.6_0.22_25)]"
        trend={{ value: "WhatsApp Cloud API", positive: true }}
      />
      <KPICard
        label="Taxa de Distribuição"
        value={`${taxaDistribuicao}%`}
        icon={Zap}
        color="text-[oklch(0.75_0.15_85)]"
        trend={{ value: "Leads atribuídos", positive: true }}
      />
    </div>
  );
}
