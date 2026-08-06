import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Building2, Clock, CheckCircle2, Shield, Calendar, RefreshCw } from "lucide-react";
import type { DatacrazyDepartment } from "@/lib/datacrazy-types";

export function DepartamentosPage() {
  const { data: rawDepts, isLoading, refetch } = trpc.dashboard.departments.useQuery();

  const departments: DatacrazyDepartment[] = (rawDepts as DatacrazyDepartment[]) || [
    {
      id: "6a5c2ecba547652405c67b0e",
      name: "Atendimento",
      color: "#EA580C",
      main: true,
      createdAt: "2026-07-19T01:56:27.040Z",
    },
    {
      id: "6a6cbce0d97edaaf109fd343",
      name: "Value Promotora",
      color: "#10B981",
      main: false,
      createdAt: "2026-07-31T15:18:56.627Z",
    },
    {
      id: "6a6d00427006365c0797014d",
      name: "Next",
      color: "#3B82F6",
      main: false,
      createdAt: "2026-07-31T20:06:26.103Z",
    },
  ];

  return (
    <div className="space-y-6 stagger-enter">
      {/* Header card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-glow" />
            <h2 className="text-lg font-bold text-foreground">Departamentos Datacrazy</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Estrutura organizacional sincronizada via API Datacrazy Messaging
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-glow bg-emerald-glow/10 border border-emerald-glow/20 rounded-lg hover:bg-emerald-glow/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sincronizar API</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept, idx) => {
          return (
            <div
              key={`dept-${dept.id || idx}-${idx}`}
              className="glass-card p-6 border-l-4 transition-all duration-200 hover:border-emerald-glow/50"
              style={{ borderLeftColor: dept.color }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dept.color }}
                    />
                    <h3 className="text-base font-bold text-foreground">{dept.name}</h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono block mt-1">
                    ID: {dept.id}
                  </span>
                </div>
                {dept.main && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Principal
                  </span>
                )}
              </div>

              {/* Info stats */}
              <div className="mt-6 pt-4 border-t border-[oklch(0.3_0.02_260/0.3)] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-glow" />
                    Horário Comercial
                  </span>
                  <span className="font-medium text-foreground">08:00 - 18:00</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Dias de Funcionamento
                  </span>
                  <span className="font-medium text-foreground">Seg a Sáb</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-glow" />
                    Status da Fila
                  </span>
                  <span className="text-emerald-glow font-semibold">Ativa e Roteando</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
