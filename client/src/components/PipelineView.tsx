import { cn } from "@/lib/utils";
import type { DashboardLead } from "@/lib/datacrazy-types";

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  leads: DashboardLead[];
}

interface PipelineViewProps {
  leads: DashboardLead[];
  stages: { id: string; name: string }[];
  onSelectLead: (lead: DashboardLead) => void;
}

const STAGE_COLORS: Record<string, string> = {
  "Novo Lead": "#3B82F6",
  "Em atendimento": "#f59e0b",
  "Em Atendimento": "#f59e0b",
  "Ganho": "#10b981",
  "won": "#10b981",
  "Perdido": "#ef4444",
  "lost": "#ef4444",
};

function getStageColor(stageName: string): string {
  return STAGE_COLORS[stageName] || `hsl(${(stageName.charCodeAt(0) * 37) % 360}, 70%, 55%)`;
}

export default function PipelineView({ leads, stages, onSelectLead }: PipelineViewProps) {
  // Build dynamic pipeline stages from real API data
  const pipelineStages: PipelineStage[] = stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    color: getStageColor(stage.name),
    leads: leads.filter((l) => l.etapa === stage.name),
  }));

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  return (
    <div className={cn(
      "grid gap-6",
      pipelineStages.length === 1 && "grid-cols-1",
      pipelineStages.length === 2 && "grid-cols-1 lg:grid-cols-2",
      pipelineStages.length >= 3 && "grid-cols-1 lg:grid-cols-3"
    )}>
      {pipelineStages.map((stage) => (
        <div key={stage.id} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
              <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
            </div>
            <span className="text-xs font-mono bg-[oklch(0.2_0.02_260)] px-2 py-1 rounded-md text-muted-foreground">
              {stage.leads.length} leads
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stage.leads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left",
                  "bg-[oklch(0.16_0.02_260/0.5)] hover:bg-[oklch(0.2_0.02_260/0.7)]",
                  lead.status === "won" && "opacity-60"
                )}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{lead.nome}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{lead.telefone}</span>
                    {lead.atendente && lead.atendente !== "Não atribuído" && (
                      <>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[11px] text-emerald-glow">{lead.atendente}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                  {formatTime(lead.dataCriacao)}
                </div>
              </button>
            ))}
            {stage.leads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum lead nesta etapa
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
