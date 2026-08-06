/**
 * Dashboard Leads - Next Distribuição Inteligente
 * Design: Data Command Center (Dark Glassmorphism)
 * Integração real com API Datacrazy via tRPC com cache
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/Sidebar";
import KPICard from "@/components/KPICard";
import AtendenteCard from "@/components/AtendenteCard";
import PipelineView from "@/components/PipelineView";
import LeadsTable from "@/components/LeadsTable";
import DatasourceCards from "@/components/DatasourceCards";
import LeadDetailModal from "@/components/LeadDetailModal";
import type {
  DashboardAttendant,
  DashboardLead,
  DashboardInstance,
} from "@/lib/datacrazy-types";
import {
  transformAttendants,
  transformLeads,
  transformInstances,
  getMetricasGerais,
  getDistribuicaoPorHora,
  getLeadsPorDatasource,
} from "@/lib/data";
import {
  MessageSquare,
  Users,
  GitBranch,
  BarChart3,
  TrendingUp,
  Zap,
  Layers,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

interface DashboardData {
  attendants: any[];
  leads: any[];
  instances: any[];
  businesses: any[];
  stages: any[];
  conversations: any[];
}

interface HomeProps {
  params?: { section?: string };
}

export default function Home({ params }: HomeProps) {
  const initialSection = params?.section || "overview";
  const [activeSection, setActiveSection] = useState(initialSection);
  const [location, setLocation] = useLocation();
  const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null);

  // Use tRPC query with 30s staleTime and refetchInterval
  const { data: rawDashboardData, isLoading, isError, error: trpcError, refetch } = trpc.dashboard.full.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 3,
    retryDelay: 2000,
  });

  useEffect(() => {
    if (params?.section) {
      setActiveSection(params.section);
    }
  }, [params?.section]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setLocation(`/${section}`);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dados atualizados");
  };

  // Transform data - cast to DashboardData since tRPC returns the same shape
  const data = (rawDashboardData as unknown as DashboardData) || null;
  const attendants: DashboardAttendant[] = data
    ? transformAttendants(data.attendants || [], data.businesses || [], data.conversations || [])
    : [];

  const leads: DashboardLead[] = data
    ? transformLeads(data.leads || [], data.businesses || [], data.stages || [], data.instances || [])
    : [];

  const instances: DashboardInstance[] = data
    ? transformInstances(data.instances || [], data.leads || [], data.conversations || [])
    : [];

  const metricas = getMetricasGerais(leads, attendants, instances);
  const distribuicaoHora = getDistribuicaoPorHora(leads);
  const leadsPorDatasource = getLeadsPorDatasource(leads, instances);

  const pipelineData = [
    { name: "Novo Lead", value: leads.filter((l) => l.etapa === "Novo Lead").length, color: "#3B82F6" },
    { name: "Em Atendimento", value: leads.filter((l) => l.etapa === "Em atendimento").length, color: "#f59e0b" },
    { name: "Finalizado", value: leads.filter((l) => l.status === "won" || l.status === "lost").length, color: "#10b981" },
  ];

  const atendentesChartData = attendants
    .filter((a) => a.status !== "offline")
    .slice(0, 10)
    .map((a) => ({
      name: a.name.split(" ")[0],
      atribuidos: a.leadsAtribuidos,
      atendendo: a.leadsEmAtendimento,
    }));

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex">
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="ml-64 flex-1 p-6 flex items-center justify-center">
          <div className="glass-card p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar dados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Não foi possível conectar à API Datacrazy. Verifique sua conexão e tente novamente.
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-emerald-glow/20 text-emerald-glow rounded-lg text-sm font-medium hover:bg-emerald-glow/30 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        <main className="ml-64 flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-emerald-glow animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando dados do Datacrazy...</span>
            </div>
          </div>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6">
        {/* Top Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {activeSection === "overview" && "Visão Geral"}
                {activeSection === "atendentes" && "Atendentes"}
                {activeSection === "pipeline" && "Pipeline Value Promotora"}
                {activeSection === "leads" && "Tracking de Leads"}
                {activeSection === "conexoes" && "Conexões & Datasources"}
                {activeSection === "analytics" && "Analytics & Métricas"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeSection === "overview" && "Distribuição inteligente de leads em tempo real"}
                {activeSection === "atendentes" && "Monitoramento dos atendentes e carga de trabalho"}
                {activeSection === "pipeline" && "Leads movimentando pelo pipeline Value Promotora"}
                {activeSection === "leads" && "Todos os leads gerados pela automação Next"}
                {activeSection === "conexoes" && "Status das conexões WhatsApp e origens de leads"}
                {activeSection === "analytics" && "Métricas detalhadas de performance e conversão"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {data && (
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-glow bg-emerald-glow/10 border border-emerald-glow/20 rounded-lg hover:bg-emerald-glow/20 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === "overview" && (
          <div className="stagger-enter space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                label="Total de Leads"
                value={metricas.totalLeads}
                icon={MessageSquare}
                color="text-emerald-glow"
                trend={{ value: "Dados reais", positive: true }}
              />
              <KPICard
                label="Atendentes Online"
                value={`${metricas.atendentesOnline}/${metricas.atendentesTotal}`}
                icon={Users}
                color="text-[oklch(0.65_0.22_250)]"
                trend={{ value: `${attendants.filter(a => a.status === "online").length} disponíveis`, positive: true }}
              />
              <KPICard
                label="Conexões Ativas"
                value={`${metricas.conexoesAtivas}/${metricas.conexoesTotal}`}
                icon={GitBranch}
                color="text-[oklch(0.6_0.22_25)]"
                trend={{ value: "WhatsApp Cloud API", positive: true }}
              />
              <KPICard
                label="Taxa de Distribuição"
                value={`${metricas.taxaDistribuicao}%`}
                icon={Zap}
                color="text-[oklch(0.75_0.15_85)]"
                trend={{ value: "Leads atribuídos", positive: true }}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leads por hora */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-glow" />
                  Leads por Hora (Hoje)
                </h3>
                {distribuicaoHora.some(d => d.leads > 0) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={distribuicaoHora}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260 / 0.3)" />
                      <XAxis dataKey="hora" stroke="oklch(0.65 0.02 260)" fontSize={11} />
                      <YAxis stroke="oklch(0.65 0.02 260)" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.16 0.02 260 / 0.95)",
                          border: "1px solid oklch(0.3 0.02 260 / 0.5)",
                          borderRadius: "8px",
                          color: "oklch(0.95 0.01 260)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="leads" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados de leads para hoje
                  </div>
                )}
              </div>

              {/* Pipeline pie */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[oklch(0.65_0.22_250)]" />
                  Distribuição do Pipeline
                </h3>
                {pipelineData.some(p => p.value > 0) ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="180" height={180}>
                      <PieChart>
                        <Pie
                          data={pipelineData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          strokeWidth={2}
                          stroke="oklch(0.16 0.02 260)"
                        >
                          {pipelineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(0.16 0.02 260 / 0.95)",
                            border: "1px solid oklch(0.3 0.02 260 / 0.5)",
                            borderRadius: "8px",
                            color: "oklch(0.95 0.01 260)",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {pipelineData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                          <span className="text-sm font-bold font-mono text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados de pipeline
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline section */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Pipeline: Value Promotora</h3>
                    <p className="text-xs text-muted-foreground">
                      {((data?.stages as any[]) || []).length} etapas • {leads.length} leads no total
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Stages from API */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {((data?.stages as any[]) || []).map((stage: any) => {
                  const stageColor = stage.name === "Novo Lead" ? "#3B82F6" : stage.name === "Em atendimento" ? "#f59e0b" : stage.name === "Ganho" || stage.name === "won" ? "#10b981" : stage.name === "Perdido" || stage.name === "lost" ? "#ef4444" : "#8b5cf6";
                  const stageLeads = leads.filter((l: DashboardLead) => l.etapa === stage.name);
                  return (
                    <div key={stage.id} className="relative p-5 rounded-lg bg-[oklch(0.16_0.02_260/0.5)] border border-white/10">
                      <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: stageColor }} />
                      <h4 className="text-sm font-semibold text-foreground mb-2">{stage.name}</h4>
                      <p className="text-3xl font-bold font-mono" style={{ color: stageColor }}>
                        {stageLeads.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stage.name === "Novo Lead" ? "Aguardando distribuição" : stage.name === "Em atendimento" ? "Ativos no atendimento" : "Leads nesta etapa"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pipeline leads list */}
            <PipelineView leads={leads} stages={(data?.stages as any[]) || []} onSelectLead={setSelectedLead} />
          </div>
        )}

        {/* Atendentes Section */}
        {activeSection === "atendentes" && (
          <div className="stagger-enter space-y-6">
            {/* Status overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold font-mono text-emerald-glow">
                    {attendants.filter(a => a.status === "online").length}
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-glow" />
              </div>
              <div className="glass-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ocupado</p>
                  <p className="text-2xl font-bold font-mono text-[oklch(0.75_0.15_85)]">
                    {attendants.filter(a => a.status === "ocupado").length}
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.15_85)]" />
              </div>
              <div className="glass-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold font-mono text-muted-foreground">
                    {attendants.filter(a => a.status === "offline").length}
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              </div>
            </div>

            {/* Attendants chart */}
            {atendentesChartData.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Leads por Atendente</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={atendentesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260 / 0.3)" />
                    <XAxis dataKey="name" stroke="oklch(0.65 0.02 260)" fontSize={11} />
                    <YAxis stroke="oklch(0.65 0.02 260)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0.02 260 / 0.95)",
                        border: "1px solid oklch(0.3 0.02 260 / 0.5)",
                        borderRadius: "8px",
                        color: "oklch(0.95 0.01 260)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="atribuidos" name="Atribuídos" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="atendendo" name="Atendendo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Attendants grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {attendants.map((atendente) => (
                <AtendenteCard key={atendente.id} atendente={atendente} />
              ))}
            </div>
          </div>
        )}

        {/* Pipeline Section */}
        {activeSection === "pipeline" && (
          <div className="stagger-enter space-y-6">
            {/* Pipeline stages visual */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Pipeline: Value Promotora</h3>
                    <p className="text-xs text-muted-foreground">
                      {((data?.stages as any[]) || []).length} etapas • {leads.length} leads no total
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {((data?.stages as any[]) || []).map((stage: any) => {
                  const stageColor = stage.name === "Novo Lead" ? "#3B82F6" : stage.name === "Em atendimento" ? "#f59e0b" : stage.name === "Ganho" || stage.name === "won" ? "#10b981" : stage.name === "Perdido" || stage.name === "lost" ? "#ef4444" : "#8b5cf6";
                  const stageLeads = leads.filter((l: DashboardLead) => l.etapa === stage.name);
                  return (
                    <div key={stage.id} className="relative p-5 rounded-lg bg-[oklch(0.16_0.02_260/0.5)] border border-white/10">
                      <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ backgroundColor: stageColor }} />
                      <h4 className="text-sm font-semibold text-foreground mb-2">{stage.name}</h4>
                      <p className="text-3xl font-bold font-mono" style={{ color: stageColor }}>
                        {stageLeads.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stage.name === "Novo Lead" ? "Aguardando distribuição" : stage.name === "Em atendimento" ? "Ativos no atendimento" : "Leads nesta etapa"}
                      </p>
                      {stageLeads.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[oklch(0.3_0.02_260/0.3)]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">Último update</span>
                            <span className="font-mono text-muted-foreground">
                              {new Date(Math.max(...stageLeads.map((l: DashboardLead) => new Date(l.dataUltimaAtualizacao).getTime()))).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pipeline leads */}
            <PipelineView leads={leads} stages={(data?.stages as any[]) || []} onSelectLead={setSelectedLead} />
          </div>
        )}

        {/* Leads Section */}
        {activeSection === "leads" && (
          <div className="stagger-enter space-y-6">
            <LeadsTable leads={leads} onSelectLead={setSelectedLead} />
          </div>
        )}

        {/* Conexoes Section */}
        {activeSection === "conexoes" && (
          <div className="stagger-enter space-y-6">
            <DatasourceCards datasources={instances} />
          </div>
        )}

        {/* Analytics Section */}
        {activeSection === "analytics" && (
          <div className="stagger-enter space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Taxa de resposta */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Taxa de Resposta por Atendente</h3>
                <div className="space-y-3">
                  {attendants
                    .filter(a => a.status !== "offline")
                    .sort((a, b) => b.taxaResposta - a.taxaResposta)
                    .slice(0, 10)
                    .map((a) => (
                      <div key={a.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[oklch(0.2_0.02_260)] flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                          {a.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">{a.name}</span>
                            <span className="text-xs font-mono text-emerald-glow">{a.taxaResposta}%</span>
                          </div>
                          <div className="h-2 bg-[oklch(0.16_0.02_260)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-glow to-emerald-glow/70 rounded-full transition-all duration-500"
                              style={{ width: `${a.taxaResposta}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Leads por datasource */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Leads por Origem</h3>
                {leadsPorDatasource.length > 0 ? (
                  <div className="space-y-3">
                    {leadsPorDatasource.map((ds, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ds.color }} />
                        <span className="text-xs text-muted-foreground w-24 truncate">{ds.name || "Desconhecido"}</span>
                        <div className="flex-1 h-2 bg-[oklch(0.16_0.02_260)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${leads.length > 0 ? (ds.count / leads.length) * 100 : 0}%`,
                              backgroundColor: ds.color,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-foreground w-8">{ds.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Sem dados de distribuição
                  </div>
                )}
              </div>
            </div>

            {/* Finalizados por atendente */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Finalizados por Atendente</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={attendants
                    .filter(a => a.status !== "offline")
                    .filter(a => a.leadsFinalizados > 0)
                    .sort((a, b) => b.leadsFinalizados - a.leadsFinalizados)
                    .slice(0, 10)
                    .map(a => ({
                      name: a.name.split(" ")[0],
                      finalizados: a.leadsFinalizados,
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260 / 0.3)" />
                  <XAxis dataKey="name" stroke="oklch(0.65 0.02 260)" fontSize={11} />
                  <YAxis stroke="oklch(0.65 0.02 260)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.02 260 / 0.95)",
                      border: "1px solid oklch(0.3 0.02 260 / 0.5)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.01 260)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="finalizados" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Lead Detail Modal */}
        {selectedLead && (
          <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
        )}
      </main>
    </div>
  );
}
