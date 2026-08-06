import { cn } from "@/lib/utils";
import type { DashboardLead } from "@/lib/datacrazy-types";
import { X, User, Phone, GitBranch, Clock } from "lucide-react";

interface LeadDetailModalProps {
  lead: DashboardLead | null;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  in_process: { label: "Em Processo", color: "bg-[#3B82F6]/20 text-[#3B82F6]" },
  won: { label: "Ganho", color: "bg-emerald-glow/20 text-emerald-glow" },
  lost: { label: "Perdido", color: "bg-red-500/20 text-red-400" },
  default: { label: "Ativo", color: "bg-muted-foreground/20 text-muted-foreground" },
};

export default function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  if (!lead) return null;

  const cfg = statusConfig[lead.status] || statusConfig.default;

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "--";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[oklch(0.2_0.02_260/0.5)] transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-4 h-4 rounded-full bg-emerald-glow" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{lead.nome}</h3>
            <span className="text-xs font-mono text-muted-foreground">{lead.id}</span>
          </div>
          <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full", cfg.color)}>
            {cfg.label}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Telefone</div>
                <div className="text-sm font-medium text-foreground">{lead.telefone || "N/A"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Origem</div>
                <div className="text-sm font-medium text-foreground">{lead.source || "n8n"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Atendente</div>
                <div className="text-sm font-medium text-foreground">{lead.atendente}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Pipeline</div>
                <div className="text-sm font-medium text-foreground">{lead.pipeline}</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-4 border-t border-[oklch(0.3_0.02_260/0.3)]">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Histórico</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-glow mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-foreground">Lead criado</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(lead.dataCriacao)}
                  </div>
                </div>
              </div>
              {lead.etapa === "Em atendimento" && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.22_250)] mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-foreground">Movido para atendimento</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(lead.dataUltimaAtualizacao)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Etapa */}
          <div className="pt-4 border-t border-[oklch(0.3_0.02_260/0.3)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Etapa atual</span>
              <span className="text-sm font-semibold text-foreground">{lead.etapa}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
