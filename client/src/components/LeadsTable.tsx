import { cn } from "@/lib/utils";
import type { DashboardLead } from "@/lib/datacrazy-types";
import { Search, Download, ChevronLeft, ChevronRight, Filter, Printer, Clock } from "lucide-react";
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
  const headers = ["ID", "Nome", "Telefone", "Email", "Conexão/Instância", "Origem/Traqueamento", "Headline Anúncio", "Departamento", "Atendente", "Etapa", "Status", "Criado em"];
  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${l.nome}"`,
    l.telefone,
    l.email || "",
    `"${l.instanciaNome || "WhatsApp Cloud API"}"`,
    `"${l.source || "Meta Ads"}"`,
    `"${l.referralHeadline || ""}"`,
    `"${l.departamento || "Atendimento"}"`,
    `"${l.atendente || "Não atribuído"}"`,
    `"${l.etapa}"`,
    `"${l.status}"`,
    new Date(l.dataCriacao).toLocaleString("pt-BR"),
  ]);

  const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-next-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function handlePrintPDF() {
  window.print();
}

export default function LeadsTable({ leads, onSelectLead }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEtapa, setFilterEtapa] = useState<string>("all");
  const [filterAttendant, setFilterAttendant] = useState<string>("all");
  const [filterOrigin, setFilterOrigin] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueEtapas = useMemo(() => Array.from(new Set(leads.map((l) => l.etapa))), [leads]);
  const uniqueAttendants = useMemo(() => Array.from(new Set(leads.map((l) => l.atendente))), [leads]);
  const uniqueOrigins = useMemo(() => Array.from(new Set(leads.map((l) => l.source || "Meta Ads"))), [leads]);
  const uniqueDepts = useMemo(() => Array.from(new Set(leads.map((l) => l.departamento || "Atendimento"))), [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEtapa = filterEtapa === "all" || lead.etapa === filterEtapa;
      const matchesAttendant = filterAttendant === "all" || lead.atendente === filterAttendant;
      const matchesOrigin = filterOrigin === "all" || (lead.source || "Meta Ads") === filterOrigin;
      const matchesDept = filterDept === "all" || (lead.departamento || "Atendimento") === filterDept;
      return matchesSearch && matchesEtapa && matchesAttendant && matchesOrigin && matchesDept;
    });
  }, [leads, searchTerm, filterEtapa, filterAttendant, filterOrigin, filterDept]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "--";
    }
  };

  return (
    <div className="glass-card p-5">
      {/* Filters Bar */}
      <div className="flex flex-col space-y-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou ID do lead..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[oklch(0.16_0.02_260/0.8)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-glow/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV(filteredLeads)}
              className="flex items-center gap-2 px-3 py-2.5 text-xs bg-emerald-glow/10 border border-emerald-glow/30 rounded-lg text-emerald-glow hover:bg-emerald-glow/20 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 px-3 py-2.5 text-xs bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir/PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={filterEtapa}
              onChange={(e) => {
                setFilterEtapa(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-[oklch(0.16_0.02_260/0.8)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-foreground"
            >
              <option value="all">Todas as Etapas</option>
              {uniqueEtapas.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {etapa}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-[oklch(0.16_0.02_260/0.8)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-foreground"
          >
            <option value="all">Todos Departamentos</option>
            {uniqueDepts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filterAttendant}
            onChange={(e) => {
              setFilterAttendant(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-[oklch(0.16_0.02_260/0.8)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-foreground"
          >
            <option value="all">Todos os Atendentes</option>
            {uniqueAttendants.map((att) => (
              <option key={att} value={att}>
                {att}
              </option>
            ))}
          </select>

          <select
            value={filterOrigin}
            onChange={(e) => {
              setFilterOrigin(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-[oklch(0.16_0.02_260/0.8)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-foreground"
          >
            <option value="all">Todas as Origens</option>
            {uniqueOrigins.map((ori) => (
              <option key={ori} value={ori}>
                {ori}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[oklch(0.3_0.02_260/0.4)]">
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Lead</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Contato</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Conexão / Canal</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Traqueamento (Anúncio / UTM)</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Departamento</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Atendente</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Etapa</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">SLA</th>
              <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-3 px-3">Criado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((lead, idx) => {
              const etapaCfg = etapaConfig[lead.etapa] || { color: "bg-muted-foreground/20 text-muted-foreground" };
              const createdAt = new Date(lead.dataCriacao);
              const now = new Date();
              const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
              // Consider SLA Excedido if it's "Novo Lead" and more than 5 minutes old
              const isSlaDelayed = lead.etapa === "Novo Lead" && diffMinutes > 5;
              const instanciaName = lead.instanciaNome || "WhatsApp Cloud API";

              return (
                <tr
                  key={`lead-${lead.id || idx}-${idx}`}
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
                    <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full inline-block">
                      {instanciaName}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-0.5 max-w-[180px]">
                      <span className="text-xs text-foreground font-medium px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono inline-block w-fit">
                        {lead.source || "Meta Ads"}
                      </span>
                      {lead.referralHeadline ? (
                        <span className="text-[10px] text-emerald-400 font-semibold truncate" title={lead.referralHeadline}>
                          "{lead.referralHeadline}"
                        </span>
                      ) : lead.ctwaClid ? (
                        <span className="text-[9px] text-muted-foreground font-mono truncate" title={lead.ctwaClid}>
                          ID: {lead.ctwaClid.substring(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60 italic">Sem headline de anúncio</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-white shadow-sm"
                      style={{ backgroundColor: lead.departamentoCor || "#EA580C" }}
                    >
                      {lead.departamento || "Atendimento"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-foreground font-medium">{lead.atendente}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn("text-[11px] font-medium px-2 py-1 rounded-full", etapaCfg.color)}>{lead.etapa}</span>
                  </td>
                  <td className="py-3 px-3">
                    {isSlaDelayed ? (
                      <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        <Clock className="w-3 h-3" />
                        SLA Excedido
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-glow font-medium bg-emerald-glow/10 px-2 py-0.5 rounded border border-emerald-glow/20">
                        No prazo
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-mono text-muted-foreground">{formatDateTime(lead.dataCriacao)}</span>
                  </td>
                </tr>
              );
            })}
            {paginatedLeads.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                  Nenhum lead encontrado com os filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filteredLeads.length} de {leads.length} leads
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
