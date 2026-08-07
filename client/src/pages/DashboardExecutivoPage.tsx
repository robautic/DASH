import React from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Award, 
  Clock, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Building2,
  Users,
  BarChart3
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

export default function DashboardExecutivoPage() {
  // Dummy data for line chart (volume of leads over time)
  const leadsOverTimeData = [
    { day: "Segunda", leads: 120, conversao: 30 },
    { day: "Terça", leads: 145, conversao: 45 },
    { day: "Quarta", leads: 110, conversao: 25 },
    { day: "Quinta", leads: 180, conversao: 60 },
    { day: "Sexta", leads: 155, conversao: 50 },
    { day: "Sábado", leads: 90, conversao: 20 },
    { day: "Domingo", leads: 70, conversao: 15 },
  ];

  // Dummy data for bar chart (conversion rates by attendant)
  const attendantConversionData = [
    { name: "João", rate: 22, leads: 150 },
    { name: "Maria", rate: 35, leads: 120 },
    { name: "Carlos", rate: 18, leads: 180 },
    { name: "Ana", rate: 28, leads: 140 },
    { name: "Lucas", rate: 15, leads: 190 },
  ];

  const kpis = [
    {
      title: "Faturamento Total Estimado",
      value: "R$ 342.500,00",
      change: "+24.8%",
      isPositive: true,
      subtext: "vs. R$ 274.400 no mês anterior",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "ROI de Mídia (ROAS Geral)",
      value: "4.82x",
      change: "+15.2%",
      isPositive: true,
      subtext: "R$ 4.82 retornados a cada R$ 1,00 investido",
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "CAC Médio Geral",
      value: "R$ 42,80",
      change: "-12.5%",
      isPositive: true, // Reducing CAC is positive!
      subtext: "Meta da diretoria: < R$ 50,00",
      icon: Target,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "SLA Primeiro Atendimento",
      value: "8 min 14 seg",
      change: "-2min 05s",
      isPositive: true,
      subtext: "Excelente • 94.2% dentro do SLA < 15min",
      icon: Clock,
      color: "from-amber-500 to-orange-600",
    },
  ];

  const channelBreakdown = [
    { channel: "Google Search & Shopping", leads: 480, conv: 105, rate: "21.8%", cost: "R$ 6.200", roi: "5.4x", badge: "Alta Intenção" },
    { channel: "Meta Ads (Instagram & FB)", leads: 620, conv: 112, rate: "18.0%", cost: "R$ 7.400", roi: "4.2x", badge: "Maior Volume" },
    { channel: "WhatsApp Direct & Site", leads: 310, conv: 82, rate: "26.4%", cost: "R$ 1.200", roi: "8.1x", badge: "Maior Conversão" },
    { channel: "TikTok Ads", leads: 210, conv: 24, rate: "11.4%", cost: "R$ 2.800", roi: "2.3x", badge: "Testes" },
    { channel: "Orgânico & Indicação", leads: 140, conv: 45, rate: "32.1%", cost: "R$ 0,00", roi: "∞", badge: "Sem Custo" },
  ];

  const departmentPerformance = [
    { dept: "Comercial - Vendas Direct", leads: 820, conv: 184, rev: "R$ 198.400", slaAvg: "6min 30s", leadRate: "22.4%" },
    { dept: "Comercial - B2B & Parcerias", leads: 340, conv: 78, rev: "R$ 104.100", slaAvg: "11min 10s", leadRate: "22.9%" },
    { dept: "Suporte & Expansão", leads: 600, conv: 106, rev: "R$ 40.000", slaAvg: "7min 45s", leadRate: "17.6%" },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-glow" />
            Dashboard Executivo da Diretoria
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visão consolidada de ROI de mídia, Custo de Aquisição (CAC), faturamento e tempos de resposta do time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Dados Auditados em Tempo Real
          </span>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="glass-card p-5 rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-extrabold text-white tracking-tight">{kpi.value}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-xs font-bold flex items-center ${kpi.isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {kpi.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{kpi.subtext}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line Chart */}
        <div className="glass-card p-6 rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Volume de Leads vs Conversões
            </h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="leads" name="Leads Gerados" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="conversao" name="Conversões" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Taxa de Conversão por Atendente (%)
            </h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendantConversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '4px' }}
                />
                <Bar dataKey="rate" name="Taxa Conversão (%)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Channel Media Performance */}
      <div className="glass-card p-6 rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-glow" />
            Performance por Canal de Mídia & Origem
          </h2>
          <span className="text-xs text-muted-foreground">Investimento total no mês: R$ 17.600,00</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="pb-3">Canal de Origem</th>
                <th className="pb-3">Leads Gerados</th>
                <th className="pb-3">Conversões</th>
                <th className="pb-3">Taxa Conv.</th>
                <th className="pb-3">Investimento</th>
                <th className="pb-3">ROI / ROAS</th>
                <th className="pb-3 text-right">Destaque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-foreground">
              {channelBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-white">{row.channel}</td>
                  <td className="py-3">{row.leads}</td>
                  <td className="py-3 text-emerald-400 font-bold">{row.conv}</td>
                  <td className="py-3 font-mono">{row.rate}</td>
                  <td className="py-3 text-muted-foreground">{row.cost}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      {row.roi}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                      {row.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Efficiency */}
      <div className="glass-card p-6 rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          Eficiência Financeira por Departamento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departmentPerformance.map((dept, i) => (
            <div key={i} className="p-4 rounded-xl bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] space-y-2">
              <span className="text-xs font-bold text-white block">{dept.dept}</span>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-muted-foreground">Faturamento:</span>
                <span className="text-sm font-extrabold text-emerald-400">{dept.rev}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                <span>Leads Atendidos:</span>
                <span className="text-white font-medium">{dept.leads}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                <span>Taxa de Conversão:</span>
                <span className="text-white font-medium">{dept.leadRate}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                <span>SLA Médio Primeiro Atendimento:</span>
                <span className="text-amber-400 font-mono font-bold">{dept.slaAvg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
