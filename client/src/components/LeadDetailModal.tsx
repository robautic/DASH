import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DashboardLead } from "@/lib/datacrazy-types";
import { X, User, Phone, GitBranch, Clock, MessageSquare, ShieldAlert, CheckCircle2, Save } from "lucide-react";
import { useUpdateLead } from "@/hooks/useLeads";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LeadDetailModalProps {
  lead: DashboardLead | null;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  in_process: { label: "Em Processo", color: "bg-[#3B82F6]/20 text-[#3B82F6]" },
  won: { label: "Ganho", color: "bg-emerald-glow/20 text-emerald-glow" },
  lost: { label: "Perdido", color: "bg-red-500/20 text-red-400" },
  default: { label: "Ativo", color: "bg-muted-foreground/20 text-muted-foreground" },
};

export default function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAtendente, setSelectedAtendente] = useState(lead?.atendente || "");
  const [selectedStatus, setSelectedStatus] = useState(lead?.status || "in_process");
  const [selectedEtapa, setSelectedEtapa] = useState(lead?.etapa || "");

  const updateLeadMutation = useUpdateLead();
  const attendantsQuery = trpc.dashboard.attendants.useQuery();

  const handleSave = async () => {
    try {
      await updateLeadMutation.mutateAsync({
        id: lead!.id,
        atendente: selectedAtendente,
        status: selectedStatus,
        etapa: selectedEtapa,
      });
      toast.success("Lead atualizado com sucesso");
      setIsEditing(false);
      onClose(); // Optional: close modal on save
    } catch (error) {
      toast.error("Erro ao atualizar lead");
    }
  };

  if (!lead) return null;

  const cfg = statusConfig[lead.status] || statusConfig.default;

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "--";
    }
  };

  const mockTimelineEvents = [
    {
      id: "1",
      title: "Lead Criado via Automação",
      desc: `Origem: ${lead.source || "Meta Ads"}`,
      time: lead.dataCriacao,
      icon: CheckCircle2,
      color: "text-emerald-glow",
    },
    {
      id: "2",
      title: "Atribuído ao Atendente",
      desc: `Responsável: ${lead.atendente}`,
      time: lead.dataCriacao,
      icon: User,
      color: "text-blue-400",
    },
    {
      id: "3",
      title: "Primeira Mensagem Enviada",
      desc: "Primeiro contato efetuado via WhatsApp Cloud API",
      time: lead.dataUltimaAtualizacao,
      icon: MessageSquare,
      color: "text-purple-400",
    },
    {
      id: "4",
      title: `Etapa Atual: ${lead.etapa}`,
      desc: "Proposta em andamento",
      time: lead.dataUltimaAtualizacao,
      icon: GitBranch,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[oklch(0.2_0.02_260/0.5)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-4 h-4 rounded-full bg-emerald-glow" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{lead.nome}</h3>
            <span className="text-xs font-mono text-muted-foreground">{lead.id}</span>
          </div>
          <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full", cfg.color)}>{cfg.label}</span>
        </div>

        {/* Details Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-[oklch(0.12_0.02_260)] p-4 rounded-xl border border-[oklch(0.3_0.02_260/0.3)]">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Telefone</div>
                <div className="text-xs font-medium text-foreground">{lead.telefone || "N/A"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Origem / Canal</div>
                <div className="text-xs font-medium text-foreground">{lead.source || "Meta Ads"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Atendente</div>
                <div className="text-xs font-medium text-foreground">{lead.atendente}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Departamento</div>
                <div
                  className="text-xs font-semibold px-2 py-0.5 rounded text-white inline-block mt-0.5"
                  style={{ backgroundColor: lead.departamentoCor || "#EA580C" }}
                >
                  {lead.departamento || "Atendimento"}
                </div>
              </div>
            </div>
          </div>

          {/* Traqueamento de Automação & Meta Ads */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Dados de Automação & Traqueamento de Anúncio
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                n8n Roteado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {lead.instanciaNome && (
                <div>
                  <span className="text-muted-foreground block text-[10px]">Instância / Conexão:</span>
                  <span className="font-semibold text-foreground">{lead.instanciaNome}</span>
                </div>
              )}
              {lead.referralHeadline && (
                <div>
                  <span className="text-muted-foreground block text-[10px]">Headline do Anúncio:</span>
                  <span className="font-semibold text-emerald-400">"{lead.referralHeadline}"</span>
                </div>
              )}
              {lead.referralSourceId && (
                <div>
                  <span className="text-muted-foreground block text-[10px]">Meta Source ID:</span>
                  <span className="font-mono text-muted-foreground text-[11px]">{lead.referralSourceId}</span>
                </div>
              )}
              {lead.cpf && (
                <div>
                  <span className="text-muted-foreground block text-[10px]">CPF Informado:</span>
                  <span className="font-mono text-foreground font-semibold">{lead.cpf}</span>
                </div>
              )}
              {lead.ctwaClid && (
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[10px]">Click ID CTWA (Meta Ads):</span>
                  <span className="font-mono text-[10px] text-muted-foreground block truncate bg-black/40 p-1 rounded">
                    {lead.ctwaClid}
                  </span>
                </div>
              )}
            </div>

            {/* Form Answers if present */}
            {lead.formAnswers && Object.keys(lead.formAnswers).length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-500/20 space-y-1.5">
                <span className="text-[11px] font-bold text-foreground block">Respostas do Formulário:</span>
                {Object.entries(lead.formAnswers).map(([q, a]) => (
                  <div key={q} className="flex flex-col text-[11px] bg-black/30 p-2 rounded">
                    <span className="text-muted-foreground text-[10px] font-medium">{q}</span>
                    <span className="text-foreground font-semibold">{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline Completa */}
          <div className="pt-4 border-t border-[oklch(0.3_0.02_260/0.3)]">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-glow" />
              Timeline do Lead (Histórico de Interações)
            </h4>
            <div className="space-y-3 relative pl-4 border-l border-[oklch(0.3_0.02_260/0.4)]">
              {mockTimelineEvents.map((evt) => {
                const IconComponent = evt.icon;
                return (
                  <div key={evt.id} className="relative group">
                    <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-[oklch(0.12_0.02_260)] border border-emerald-glow flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-glow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <IconComponent className={cn("w-3.5 h-3.5", evt.color)} />
                        <span className="text-xs font-semibold text-foreground">{evt.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{evt.desc}</p>
                      <span className="text-[10px] text-muted-foreground/70 font-mono mt-0.5 block">
                        {formatDateTime(evt.time)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions (Update Lead) */}
          <div className="pt-4 border-t border-[oklch(0.3_0.02_260/0.3)] space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-emerald-glow" />
              Ações Rápidas (Atualizar Lead)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Status do Lead</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[oklch(0.12_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-glow/50"
                >
                  <option value="in_process">Em Processo</option>
                  <option value="won">Ganho</option>
                  <option value="lost">Perdido</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Atendente Responsável</label>
                <select
                  value={selectedAtendente}
                  onChange={(e) => setSelectedAtendente(e.target.value)}
                  className="w-full bg-[oklch(0.12_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-glow/50"
                >
                  <option value="">Selecione um atendente...</option>
                  {attendantsQuery.data?.map((att: any) => (
                    <option key={att.id} value={att.name || att.email}>{att.name || att.email}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] text-muted-foreground font-medium">Etapa do Funil</label>
                <input
                  type="text"
                  value={selectedEtapa}
                  onChange={(e) => setSelectedEtapa(e.target.value)}
                  placeholder="Ex: Novo Contato, Em Negociação..."
                  className="w-full bg-[oklch(0.12_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-glow/50"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={updateLeadMutation.isPending}
                className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {updateLeadMutation.isPending ? "Salvando..." : <><Save className="w-3.5 h-3.5" /> Salvar Alterações</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}