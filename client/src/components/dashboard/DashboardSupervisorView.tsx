import React from "react";
import { Users, Clock, AlertTriangle, TrendingUp, CheckCircle, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { DashboardAttendant, DashboardLead } from "@/lib/datacrazy-types";
import KPICard from "../KPICard";

interface DashboardSupervisorViewProps {
  attendants: DashboardAttendant[];
  leads: DashboardLead[];
  departmentName?: string;
}

export function DashboardSupervisorView({
  attendants,
  leads,
  departmentName = "Comercial",
}: DashboardSupervisorViewProps) {
  // Filter department data
  const deptLeads = leads.filter(
    (l) => (l.departamento || "").toLowerCase().includes(departmentName.toLowerCase()) || leads.length < 50
  );

  const totalDeptLeads = deptLeads.length;
  const leadsInQueue = deptLeads.filter((l) => l.status === "novo" || l.status === "em_andamento").length;
  const leadsWon = deptLeads.filter((l) => l.status === "ganho").length;
  const conversionRate = totalDeptLeads > 0 ? ((leadsWon / totalDeptLeads) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Painel de Supervisão — {departmentName}
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                Gestão de Equipe
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhamento de SLA, distribuição de carga e desempenho individual dos atendentes
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Leads do Departamento"
          value={totalDeptLeads}
          icon={Users}
          color="text-blue-400"
          trend={{ value: `${departmentName}`, positive: true }}
        />
        <KPICard
          label="Em Atendimento"
          value={leadsInQueue}
          icon={Clock}
          color="text-amber-400"
          trend={{ value: "Fila ativa", positive: true }}
        />
        <KPICard
          label="Conversões Concluídas"
          value={leadsWon}
          icon={CheckCircle}
          color="text-emerald-400"
          trend={{ value: `${conversionRate}% de conversão`, positive: true }}
        />
        <KPICard
          label="Atendentes na Equipe"
          value={attendants.length}
          icon={ShieldCheck}
          color="text-purple-400"
          trend={{ value: `${attendants.filter((a) => a.status === "online").length} online agora`, positive: true }}
        />
      </div>

      {/* Attendants Workload Grid */}
      <div className="p-5 rounded-2xl bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-glow" />
              Carga de Trabalho da Equipe
            </h3>
            <p className="text-xs text-muted-foreground">Distribuição atual de leads por atendente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {attendants.map((attendant) => {
            const attLeads = deptLeads.filter((l) => l.atendente.toLowerCase().includes(attendant.name.toLowerCase().split(" ")[0]));
            const count = attLeads.length || attendant.leadsAtribuidos;
            const wonCount = attLeads.filter((l) => l.status === "ganho").length || attendant.leadsFinalizados;
            const convRate = count > 0 ? ((wonCount / count) * 100).toFixed(0) : "0";
            const isOnline = attendant.status === "online";

            return (
              <div
                key={attendant.id}
                className="p-4 rounded-xl bg-[oklch(0.18_0.02_260)] border border-[oklch(0.28_0.02_260/0.4)] hover:border-emerald-glow/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={attendant.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendant.name)}&background=10b981&color=fff`}
                        alt={attendant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[oklch(0.18_0.02_260)] ${
                          isOnline ? "bg-emerald-500" : "bg-slate-500"
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{attendant.name}</span>
                      <span className="text-xs text-slate-400">{isOnline ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20">
                    {count} leads
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Taxa de Conversão</span>
                    <span className="text-emerald-400 font-bold">{convRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${Math.min(100, Number(convRate))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
