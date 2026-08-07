import React from "react";
import { MessageSquare, CheckCircle2, Clock, PhoneCall, ArrowUpRight, Sparkles, User, Tag } from "lucide-react";
import { DashboardLead } from "@/lib/datacrazy-types";
import KPICard from "../KPICard";

interface DashboardAtendenteViewProps {
  attendantName: string;
  leads: DashboardLead[];
  onSelectLead?: (lead: DashboardLead) => void;
}

export function DashboardAtendenteView({
  attendantName,
  leads,
  onSelectLead,
}: DashboardAtendenteViewProps) {
  const firstName = attendantName.split(" ")[0].toLowerCase();

  // Filter leads for this attendant
  const myLeads = leads.filter((l) => l.atendente.toLowerCase().includes(firstName)) || leads.slice(0, 15);

  const activeLeads = myLeads.filter((l) => l.status !== "ganho" && l.status !== "perdido").length;
  const wonLeads = myLeads.filter((l) => l.status === "ganho").length;
  const totalMyLeads = myLeads.length;
  const conversionRate = totalMyLeads > 0 ? ((wonLeads / totalMyLeads) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-glow flex items-center justify-center font-bold">
            <User className="w-6 h-6 text-emerald-glow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Olá, {attendantName}!
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-glow text-xs font-semibold">
                Meu Painel de Atendimento
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Acompanhe sua carteira de clientes, próximos contatos e metas individuais
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Meus Leads Ativos"
          value={activeLeads}
          icon={MessageSquare}
          color="text-emerald-glow"
          trend={{ value: "Fila individual", positive: true }}
        />
        <KPICard
          label="Minhas Conversões"
          value={wonLeads}
          icon={CheckCircle2}
          color="text-blue-400"
          trend={{ value: `${conversionRate}% de taxa`, positive: true }}
        />
        <KPICard
          label="Carteira Total"
          value={totalMyLeads}
          icon={Tag}
          color="text-purple-400"
          trend={{ value: "Leads atribuídos", positive: true }}
        />
        <KPICard
          label="Tempo Médio"
          value="4.2 min"
          icon={Clock}
          color="text-amber-400"
          trend={{ value: "SLA excelente", positive: true }}
        />
      </div>

      {/* My Active Leads Table */}
      <div className="p-5 rounded-2xl bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-glow" />
              Minha Carteira de Leads Abertos ({myLeads.length})
            </h3>
            <p className="text-xs text-muted-foreground">Clique em um lead para ver o histórico e detalhes</p>
          </div>
        </div>

        {myLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Nenhum lead atribuído diretamente no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-4">Contato</th>
                  <th className="py-3 px-4">Etapa do Funil</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead?.(lead)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-glow flex items-center justify-center font-semibold text-xs shrink-0">
                        {lead.nome.charAt(0)}
                      </div>
                      <span className="truncate max-w-[180px]">{lead.nome}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{lead.telefone || "Sem telefone"}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {lead.etapa}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          lead.status === "ganho"
                            ? "bg-emerald-500/20 text-emerald-glow border border-emerald-500/30"
                            : lead.status === "perdido"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead?.(lead);
                        }}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-glow hover:bg-emerald-500/20 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>Abrir</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
