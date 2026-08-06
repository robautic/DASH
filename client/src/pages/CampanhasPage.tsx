import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Target, TrendingUp, DollarSign, Award, Users, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CampaignItem {
  id: string;
  name: string;
  channel: string;
  leads: number;
  conversions: number;
  revenue: number;
  cost: number;
  cpc: number;
  cpa: number;
  ticket: number;
  roi: number;
}

const mockCampaigns: CampaignItem[] = [
  {
    id: "1",
    name: "Google Ads - Empréstimo Consignado",
    channel: "Google Ads",
    leads: 184,
    conversions: 42,
    revenue: 126000,
    cost: 14500,
    cpc: 4.2,
    cpa: 345.2,
    ticket: 3000,
    roi: 768.9,
  },
  {
    id: "2",
    name: "Meta Ads - Credito FGTS WhatsApp",
    channel: "Meta Ads",
    leads: 245,
    conversions: 58,
    revenue: 145000,
    cost: 18200,
    cpc: 3.1,
    cpa: 313.7,
    ticket: 2500,
    roi: 696.7,
  },
  {
    id: "3",
    name: "TikTok - Portabilidade Bancária",
    channel: "TikTok Ads",
    leads: 98,
    conversions: 16,
    revenue: 48000,
    cost: 8900,
    cpc: 2.8,
    cpa: 556.2,
    ticket: 3000,
    roi: 439.3,
  },
  {
    id: "4",
    name: "Organico / Inbound Site",
    channel: "Orgânico",
    leads: 112,
    conversions: 31,
    revenue: 93000,
    cost: 1200,
    cpc: 0,
    cpa: 38.7,
    ticket: 3000,
    roi: 7650.0,
  },
];

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

export function CampanhasPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = mockCampaigns.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.channel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = mockCampaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalCost = mockCampaigns.reduce((acc, c) => acc + c.cost, 0);
  const totalLeads = mockCampaigns.reduce((acc, c) => acc + c.leads, 0);
  const totalConversions = mockCampaigns.reduce((acc, c) => acc + c.conversions, 0);
  const avgROI = Math.round(((totalRevenue - totalCost) / totalCost) * 100);

  const handleExportCSV = () => {
    const headers = "Campanha,Canal,Leads,Conversões,Receita,Custo,CPC,CPA,Ticket Médio,ROI%\n";
    const rows = mockCampaigns
      .map((c) => `"${c.name}","${c.channel}",${c.leads},${c.conversions},${c.revenue},${c.cost},${c.cpc},${c.cpa},${c.ticket},${c.roi}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `campanhas_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 stagger-enter">
      <DashboardHeader
        title="Gestão de Campanhas & Performance"
        subtitle="Acompanhe o ROI, Custo por Aquisição (CPA) e conversão financeira por canal de marketing"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Receita Gerada</span>
            <DollarSign className="w-4 h-4 text-emerald-glow" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <p className="text-[11px] text-emerald-glow">+18% em relação ao mês anterior</p>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Custo Total em Ads</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <p className="text-[11px] text-muted-foreground">Custo médio por lead: R$ {(totalCost / totalLeads).toFixed(2)}</p>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">ROI Geral das Campanhas</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-emerald-glow">{avgROI}%</div>
          <p className="text-[11px] text-muted-foreground">Retorno médio sobre investimento</p>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Conversões de Venda</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-foreground">{totalConversions} vendas</div>
          <p className="text-[11px] text-muted-foreground">
            Taxa global: {Math.round((totalConversions / totalLeads) * 100)}%
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-glow" />
          Comparativo de Receita por Campanha (R$)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockCampaigns} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff", fontSize: 12 }}
                formatter={(val: number) => [val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Receita"]}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {mockCampaigns.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table & Actions */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome de campanha ou canal..."
              className="pl-9 bg-[oklch(0.12_0.02_260)] border-[oklch(0.3_0.02_260/0.4)] text-xs text-foreground"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-glow/10 border border-emerald-glow/20 text-emerald-glow rounded-lg hover:bg-emerald-glow/20 text-xs font-medium transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[oklch(0.3_0.02_260/0.4)] text-muted-foreground font-semibold">
                <th className="py-3 px-3">Campanha</th>
                <th className="py-3 px-3">Canal</th>
                <th className="py-3 px-3 text-right">Leads</th>
                <th className="py-3 px-3 text-right">Vendas</th>
                <th className="py-3 px-3 text-right">Custo</th>
                <th className="py-3 px-3 text-right">CPA</th>
                <th className="py-3 px-3 text-right">Receita</th>
                <th className="py-3 px-3 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[oklch(0.3_0.02_260/0.2)]">
              {filtered.map((c, idx) => (
                <tr key={`camp-${c.id || idx}-${idx}`} className="hover:bg-[oklch(0.2_0.02_260/0.3)] transition-colors">
                  <td className="py-3 px-3 font-medium text-foreground">{c.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {c.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{c.leads}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-glow font-semibold">{c.conversions}</td>
                  <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                    {c.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {c.cpa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                    {c.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-glow font-bold">{c.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
