import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GitBranch, Filter, CheckCircle, AlertTriangle, UserCheck } from "lucide-react";
import type { DashboardLead } from "@/lib/datacrazy-types";

interface FunnelStep {
  id: string;
  name: string;
  count: number;
  conversionRate: number;
  dropRate: number;
  totalValue: number;
  color: string;
  description: string;
}

interface FunilPageProps {
  leads?: DashboardLead[];
}

export function FunilPage({ leads = [] }: FunilPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  // Filter leads by selected period
  const filteredLeads = leads.filter((lead) => {
    if (selectedPeriod === "all") return true;
    if (!lead.dataCriacao) return true;
    const leadDate = new Date(lead.dataCriacao);
    const now = new Date();

    if (selectedPeriod === "today") {
      return leadDate.toDateString() === now.toDateString();
    }
    if (selectedPeriod === "week") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return leadDate >= oneWeekAgo;
    }
    if (selectedPeriod === "month") {
      return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
    }
    if (selectedPeriod === "quarter") {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return leadDate >= threeMonthsAgo;
    }
    return true;
  });

  const totalLeads = filteredLeads.length;
  const emAtendimento = filteredLeads.filter(
    (l) => l.etapa === "Em atendimento" || l.etapa === "Em Atendimento" || (l.atendente && l.atendente !== "Não atribuído")
  ).length;
  const qualificados = filteredLeads.filter(
    (l) => l.status === "in_process" && l.etapa !== "Novo Lead"
  ).length;
  const ganho = filteredLeads.filter(
    (l) => l.status === "won" || l.etapa === "Ganho" || l.etapa === "Venda Concluída"
  ).length;

  const step1Count = totalLeads || 0;
  const step2Count = Math.max(emAtendimento, ganho + qualificados);
  const step3Count = qualificados + ganho;
  const step4Count = ganho;

  const calcConv = (curr: number, prev: number) => (prev > 0 ? Math.round((curr / prev) * 100) : 0);

  const funnelSteps: FunnelStep[] = [
    {
      id: "1",
      name: "1. Entrada de Leads",
      count: step1Count,
      conversionRate: 100,
      dropRate: 0,
      totalValue: step1Count * 3000,
      color: "#3b82f6",
      description: "Novos contatos registrados no sistema",
    },
    {
      id: "2",
      name: "2. Em Atendimento",
      count: step2Count,
      conversionRate: calcConv(step2Count, step1Count),
      dropRate: 100 - calcConv(step2Count, step1Count),
      totalValue: step2Count * 3000,
      color: "#8b5cf6",
      description: "Atribuídos e em conversa com atendentes",
    },
    {
      id: "3",
      name: "3. Qualificação & Proposta",
      count: step3Count,
      conversionRate: calcConv(step3Count, step2Count),
      dropRate: 100 - calcConv(step3Count, step2Count),
      totalValue: step3Count * 3000,
      color: "#f59e0b",
      description: "Simulação realizada e proposta enviada",
    },
    {
      id: "4",
      name: "4. Venda Concluída (Ganho)",
      count: step4Count,
      conversionRate: calcConv(step4Count, step3Count),
      dropRate: 100 - calcConv(step4Count, step3Count),
      totalValue: step4Count * 3000,
      color: "#10b981",
      description: "Negócio fechado e proposta assinada",
    },
  ];

  const totalInput = funnelSteps[0].count;
  const totalWon = funnelSteps[3].count;
  const globalConversion = totalInput > 0 ? Math.round((totalWon / totalInput) * 100) : 0;

  return (
    <div className="space-y-6 stagger-enter">
      <DashboardHeader
        title="Funil de Conversão Comercial"
        subtitle="Mapeamento completo da jornada do lead em todo o histórico da API DataCrazy"
      />

      {/* Control Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-card p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-glow" />
          <span className="text-xs font-medium text-foreground">Período de Análise:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[oklch(0.12_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] text-xs text-foreground cursor-pointer font-medium"
          >
            <option value="all">Todo o Histórico ({leads.length} leads)</option>
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">
            Taxa de Conversão Global: <strong className="text-emerald-glow font-mono text-sm">{globalConversion}%</strong>
          </span>
          <span className="text-muted-foreground">
            Leads em Processo: <strong className="text-foreground font-mono">{funnelSteps[1].count}</strong>
          </span>
        </div>
      </div>

      {/* Funnel Visual Container */}
      <div className="space-y-4">
        {funnelSteps.map((step, index) => {
          const maxVal = Math.max(...funnelSteps.map((s) => s.count), 1);
          const widthPercent = Math.max(15, Math.round((step.count / maxVal) * 100));

          return (
            <div key={`step-${step.id || index}-${index}`} className="glass-card p-5 relative overflow-hidden transition-all hover:border-emerald-glow/40">
              <div
                className="absolute left-0 top-0 bottom-0 w-2"
                style={{ backgroundColor: step.color }}
              />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: step.color }}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-base font-bold text-foreground">{step.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground pl-10">{step.description}</p>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Volume de Leads</span>
                    <span className="text-lg font-bold font-mono text-foreground">{step.count} leads</span>
                  </div>

                  {index > 0 && (
                    <div className="text-right bg-emerald-glow/10 border border-emerald-glow/20 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] text-muted-foreground block">Conversão da Etapa</span>
                      <span className="text-xs font-bold text-emerald-glow">{step.conversionRate}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar Visual Representation */}
              <div className="mt-4 w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${widthPercent}%`, backgroundColor: step.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-glow">
            <CheckCircle className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Total de Leads do Histórico</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Você está visualizando <strong>{totalLeads} leads</strong> carregados da API DataCrazy.
          </p>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Leads em Atendimento</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Existem <strong>{emAtendimento} leads</strong> em fase de atendimento ativo no pipeline.
          </p>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <UserCheck className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Vendas Concluídas</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Total de <strong>{ganho} negociações concluídas com sucesso</strong> no histórico.
          </p>
        </div>
      </div>
    </div>
  );
}

