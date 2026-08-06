import { cn } from "@/lib/utils";
import type { DashboardAttendant } from "@/lib/datacrazy-types";

interface AtendenteCardProps {
  atendente: DashboardAttendant;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  online: "bg-emerald-glow",
  ocupado: "bg-[oklch(0.75_0.15_85)]",
  offline: "bg-muted-foreground/40",
};

const statusLabels: Record<string, string> = {
  online: "Online",
  ocupado: "Ocupado",
  offline: "Offline",
};

export default function AtendenteCard({ atendente, onClick }: AtendenteCardProps) {
  const initials = atendente.name.split(" ").map(n => n[0]).join("").substring(0, 2);

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card glass-card-hover p-4 transition-all duration-300 cursor-pointer",
        "hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          {atendente.image ? (
            <img
              src={atendente.image}
              alt={atendente.name}
              className="w-10 h-10 rounded-full object-cover border border-[oklch(0.3_0.02_260/0.5)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[oklch(0.2_0.02_260)] flex items-center justify-center text-sm font-bold text-foreground border border-[oklch(0.3_0.02_260/0.5)]">
              {initials}
            </div>
          )}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[oklch(0.12_0.02_260)]",
            statusColors[atendente.status],
            atendente.status === "online" && "pulse-indicator"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">{atendente.name}</h4>
          <span className="text-[11px] text-muted-foreground">{statusLabels[atendente.status]}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-lg font-bold font-mono text-emerald-glow">{atendente.leadsAtribuidos}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Atribuídos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold font-mono text-[oklch(0.65_0.22_250)]">{atendente.leadsEmAtendimento}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Atendendo</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold font-mono text-foreground">{atendente.leadsFinalizados}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Finalizados</div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted-foreground">Taxa de Resposta</span>
          <span className="font-mono font-semibold text-foreground">{atendente.taxaResposta}%</span>
        </div>
        <div className="h-1.5 bg-[oklch(0.2_0.02_260)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-glow to-[oklch(0.65_0.22_250)] transition-all duration-500"
            style={{ width: `${atendente.taxaResposta}%` }}
          />
        </div>
      </div>

      {/* Tempo médio */}
      <div className="mt-3 pt-3 border-t border-[oklch(0.3_0.02_260/0.3)] flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Última atividade</span>
        <span className="text-xs font-mono font-medium text-foreground">{atendente.ultimasAtualizacoes}</span>
      </div>
    </div>
  );
}
