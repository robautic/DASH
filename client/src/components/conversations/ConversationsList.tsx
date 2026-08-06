import { useState } from "react";
import { MessageSquare, Clock, User, Phone, Tag, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConversationItem {
  id: string;
  contactName?: any;
  phone?: any;
  lastMessage?: any;
  lastMessageTime?: string;
  attendantName?: any;
  status?: string;
  tags?: string[];
  unreadCount?: number;
}

interface ConversationsListProps {
  conversations: ConversationItem[];
}

function getMessageString(msg: any): string {
  if (!msg) return "";
  if (typeof msg === "string") return msg;
  if (typeof msg === "object") {
    return msg.content || msg.text || msg.body || msg.message || "";
  }
  return String(msg);
}

export function ConversationsList({ conversations }: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = conversations.filter((c) => {
    const nameStr = String(c.contactName || c.phone || "");
    const nameMatch = nameStr.toLowerCase().includes(searchTerm.toLowerCase());
    const msgStr = getMessageString(c.lastMessage);
    const messageMatch = msgStr.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "all" || (c.status || "open") === statusFilter;
    return (nameMatch || messageMatch) && statusMatch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-card p-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou mensagem..."
            className="pl-9 bg-[oklch(0.12_0.02_260)] border-[oklch(0.3_0.02_260/0.4)] text-foreground text-xs"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[oklch(0.12_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] text-xs text-foreground"
          >
            <option value="all">Todos os Status</option>
            <option value="open">Abertas</option>
            <option value="waiting">Aguardando</option>
            <option value="closed">Finalizadas</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="glass-card divide-y divide-[oklch(0.3_0.02_260/0.3)]">
        {filtered.length > 0 ? (
          filtered.map((conv, idx) => (
            <div
              key={`conv-${conv.id || idx}-${idx}`}
              className="p-4 hover:bg-[oklch(0.2_0.02_260/0.4)] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-glow/10 border border-emerald-glow/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-emerald-glow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {String(conv.contactName || conv.phone || "Contato Sem Nome")}
                    </h4>
                    {conv.status && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-glow/15 text-emerald-glow border border-emerald-glow/20 uppercase tracking-wider">
                        {String(conv.status)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {getMessageString(conv.lastMessage) || "Nenhuma mensagem gravada"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {String(conv.phone || "Não informado")}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      {String(conv.attendantName || "Não atribuído")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:flex-col sm:items-end text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Recentemente"}
                </span>
                {conv.tags && conv.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-glow" />
                    <span className="text-emerald-glow font-mono text-[10px]">{conv.tags.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
            <span>Nenhuma conversa encontrada para os filtros aplicados</span>
          </div>
        )}
      </div>
    </div>
  );
}
