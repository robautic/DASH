import { cn } from "@/lib/utils";
import type { DashboardLead } from "@/lib/datacrazy-types";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

interface LeadsTableProps {
  leads: DashboardLead[];
  onSelectLead: (lead: DashboardLead) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  in_process: { label: "Em Processo", color: "bg-[#3B82F6]/20 text-[#3B82F6]" },
  won: { label: "Ganho", color: "bg-emerald-glow/20 text-emerald-glow" },
  lost: { label: "Perdido", color: "bg-red-500/20 text-red-400" },
  novo: { label: "Novo", color: "bg-[oklch(0.75_0.15_85)]/20 text-[oklch(0.75_0.15_85)]" },
};

const etapaConfig: Record<string, { color: string }> = {
  "Novo Lead": { color: "bg-[#3B82F6]/20 text-[#3B82F6]" },
  "Em atendimento": { color: "bg-[oklch(0.75_0.15_85)]/20 text-[oklch(0.75_0.15_85)]" },
};

const ITEMS_PER_PAGE = 25;

function exportToCSV(leads: DashboardLead[]) {
  const headers = ["Nome", "Telefone", "Email", "Origem", "Atendente", "Etapa", "Status", "Criado em", "Última atualização"];
  const rows = leads.map(l => [
    `"${l.nome}"`,
    l.telefone,
    l.email,
    l.source || "n8n",
    l.atendente,
    l.etapa,
    l.status,
    new Date(l.dataCriacao).toLocaleString("pt-BR"),
    new Date(l.dataUltimaAtualizacao).toLocaleString("pt-BR"),
  ]);

  const csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-next-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function LeadsTable({ leads, onSelectLead }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEtapa, setFilterEtapa] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLeads = useMemo(() => leads.filter(lead => {
    const matchesSearch = lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEtapa = filterEtapa === "all" || lead.etapa === filterEtapa;
    return matchesSearch && matchesEtapa;
  }), [leads, searchTerm, filterEtapa]);

  // Reset page when filters change
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "--";
    }
  };

  const uniqueEtapas = useMemo(() => Array.from(new Set(leads.map(l => l.etapa))), [leads]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEtapaChange = (value: string) => {
    setFilterEtapa(value);
    setCurrentPage(1);
  };

  return (
    <div className="glass-card p-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[oklch(0.16_0.02_260/0.8)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-glow/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterEtapa}
            onChange={(e) => handleEtapaChange(e.target.value)}
            className="px-3 py-2.5 text-sm bg-[oklch(0.16_0.02_260/0.8)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-foreground focus:outline-none focus:border-emerald-glow/50"
          >
            <option value="all">Todas as Etapas</option>
            {uniqueEtapas.map(etapa => (
              <option key={etapa} value={etapa}>{etapa}</option>
            ))}
          </select>
          <button
            onClick={() => exportToCSV(filteredLeads)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm bg-emerald-glow/10 border border-emerald-glow/30 rounded-lg text-emerald-glow hover:bg-emerald-glow/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[oklch(0.3_0.02_260/0.4)]">
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Lead</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Contato</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Origem</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Atendente</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Etapa</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Criado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((lead) => {
              const cfg = statusConfig[lead.status] || statusConfig.in_process;
              const etapaCfg = etapaConfig[lead.etapa] || { color: "bg-muted-foreground/20 text-muted-foreground" };
              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="border-b border-[oklch(0.3_0.02_260/0.2)] hover:bg-[oklch(0.2_0.02_260/0.3)] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-glow flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{lead.nome}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{lead.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-xs text-foreground">{lead.telefone}</div>
                    {lead.email && <div className="text-[10px] text-muted-foreground">{lead.email}</div>}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-muted-foreground">{lead.source || "n8n"}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-foreground">{lead.atendente}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn("text-[11px] font-medium px-2 py-1 rounded-full", etapaCfg.color)}>
                      {lead.etapa}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-mono text-muted-foreground">{formatDateTime(lead.dataCriacao)}</span>
                  </td>
                </tr>
              );
            })}
            {paginatedLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                  Nenhum lead encontrado com os filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{filteredLeads.length} de {leads.length} leads</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[oklch(0.16_0.02_260)] hover:bg-[oklch(0.2_0.02_260)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Anterior</span>
            </button>
            <span className="font-mono">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[oklch(0.16_0.02_260)] hover:bg-[oklch(0.2_0.02_260)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span>Próxima</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
