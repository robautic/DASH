import type { DashboardInstance } from "@/lib/datacrazy-types";
import { Radio } from "lucide-react";

interface DatasourceCardsProps {
  datasources: DashboardInstance[];
}

export default function DatasourceCards({ datasources }: DatasourceCardsProps) {
  const totalHoje = datasources.reduce((sum, d) => sum + d.leadsHoje, 0);
  const totalGeral = datasources.reduce((sum, d) => sum + d.leadsTotal, 0);
  const ativos = datasources.filter(d => d.isActive && d.status === "CONNECTED").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card p-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-glow" />
          <span className="text-sm font-medium text-foreground">{datasources.length} Conexões ({ativos} ativas)</span>
        </div>
        <div className="flex-1" />
        <div className="text-right">
          <div className="text-xl font-bold font-mono text-emerald-glow">{totalHoje}</div>
          <div className="text-[11px] text-muted-foreground">Leads hoje</div>
        </div>
        <div className="w-px h-8 bg-[oklch(0.3_0.02_260/0.4)]" />
        <div className="text-right">
          <div className="text-xl font-bold font-mono text-foreground">{totalGeral}</div>
          <div className="text-[11px] text-muted-foreground">Total acumulado</div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {datasources.map((ds, index) => (
          <div
            key={ds.id}
            className="glass-card glass-card-hover p-4 transition-all duration-300"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ds.color }}
                />
                <div className={`w-2 h-2 rounded-full ${ds.isActive && ds.status === "CONNECTED" ? "bg-emerald-glow" : "bg-muted-foreground/40"}`} />
              </div>
              <span className="text-xs font-medium text-foreground truncate">{ds.name}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">{ds.leadsHoje}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">leads hoje</div>
            <div className="mt-3 pt-3 border-t border-[oklch(0.3_0.02_260/0.3)]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-medium text-muted-foreground">{ds.leadsTotal}</span>
              </div>
              {ds.phoneNumber && (
                <div className="flex items-center justify-between text-[10px] mt-1">
                  <span className="text-muted-foreground">Número</span>
                  <span className="font-mono text-muted-foreground">{ds.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
