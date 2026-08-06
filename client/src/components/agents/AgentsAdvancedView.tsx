import { useState } from "react";
import { User, Clock, CheckCircle2, TrendingUp, Target, Filter, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DashboardAttendant } from "@/lib/datacrazy-types";

interface AgentsAdvancedViewProps {
  attendants: DashboardAttendant[];
}

export function AgentsAdvancedView({ attendants }: AgentsAdvancedViewProps) {
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = attendants.filter((a) => {
    const nameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch;
  });

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-card p-4">
        <div className="relative flex-1 w-full">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do atendente..."
            className="bg-[oklch(0.12_0.02_260)] border-[oklch(0.3_0.02_260/0.4)] text-xs text-foreground"
          />
        </div>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((agent, idx) => {
          const targetConversions = 30; // default goal
          const goalPercent = Math.min(100, Math.round((agent.leadsFinalizados / targetConversions) * 100));

          return (
            <div key={`agent-${agent.id || idx}-${idx}`} className="glass-card p-4 space-y-4 hover:border-emerald-glow/40 transition-all">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    {agent.image ? (
                      <img src={agent.image} alt={agent.name} className="w-9 h-9 rounded-full object-cover border border-emerald-glow/20" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-glow/10 border border-emerald-glow/20 flex items-center justify-center font-bold text-emerald-glow text-xs">
                        {agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[oklch(0.12_0.02_260)] ${
                        agent.status === "online" ? "bg-emerald-glow" : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{agent.name}</h4>
                    <span className="text-[10px] text-muted-foreground block">{agent.email || "Sem departamento"}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  agent.status === "online" 
                    ? "text-emerald-glow bg-emerald-glow/10 border-emerald-glow/20" 
                    : "text-muted-foreground bg-white/5 border-white/10"
                }`}>
                  {agent.status === "online" ? "Online" : "Offline"}
                </span>
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[oklch(0.12_0.02_260)] p-3 rounded-lg border border-[oklch(0.3_0.02_260/0.3)]">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Leads Recebidos</span>
                  <strong className="text-foreground font-mono">{agent.leadsAtribuidos}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Leads Ativos</span>
                  <strong className="text-blue-400 font-mono">{agent.leadsEmAtendimento}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Conversões</span>
                  <strong className="text-emerald-glow font-mono">{agent.leadsFinalizados}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Taxa Resposta</span>
                  <strong className="text-emerald-glow font-mono">{Math.round(agent.taxaResposta)}%</strong>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-glow" /> T.M. de Resposta
                  </span>
                  <span className="font-mono text-foreground font-medium">{agent.tempoMedioResposta}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-400" /> Tickets Ativos
                  </span>
                  <span className="font-mono text-foreground font-medium">{agent.leadsEmAtendimento}</span>
                </div>
              </div>

              {/* Goal Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Meta de Vendas ({targetConversions})</span>
                  <span className="text-emerald-glow font-bold">{goalPercent}%</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-emerald-glow rounded-full transition-all" style={{ width: `${goalPercent}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
