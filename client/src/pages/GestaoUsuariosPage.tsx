import React, { useState } from "react";
import { useAuth, User } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { UserRole } from "@/types";
import { 
  Users, 
  UserPlus, 
  Shield, 
  User as UserIcon, 
  Building2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Search,
  KeyRound,
  Sparkles,
  Filter
} from "lucide-react";
import { toast } from "sonner";

export default function GestaoUsuariosPage() {
  const { currentUser } = useAuth();
  const { data: rawAttendants = [], isLoading } = trpc.dashboard.attendants.useQuery();
  
  // Transform DataCrazy attendants to local User format for UI
  const usersList: User[] = rawAttendants.map((att: any) => ({
    id: String(att.id),
    name: att.name || "Sem Nome",
    email: att.email || `${att.id}@datacrazy.com`,
    role: "attendant",
    department: "Comercial",
    supervisorName: "-",
    status: att.active ? "ativo" : "inativo",
    lastAccess: "Desconhecido",
    avatarUrl: att.avatar || "",
  }));

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Shield className="w-3 h-3" /> Administrador
          </span>
        );
      case "supervisor":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Building2 className="w-3 h-3" /> Supervisor
          </span>
        );
      case "attendant":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <UserIcon className="w-3 h-3" /> Atendente
          </span>
        );
      case "viewer":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Eye className="w-3 h-3" /> Visualizador
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-glow" />
            Gestão de Usuários
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize os atendentes sincronizados com a DataCrazy API.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-xl border border-[oklch(0.3_0.02_260/0.4)] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-glow/60"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[oklch(0.14_0.02_260)] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Colaborador</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Departamento</th>
                <th className="p-4">Cargo / Perfil</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                    Carregando usuários da DataCrazy...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-white block">{user.name}</span>
                          {currentUser?.id === user.id && (
                            <span className="text-[10px] text-emerald-glow font-mono">(Você está logado)</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-muted-foreground">{user.email}</td>

                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-white/5 text-xs font-medium text-white">
                        {user.department || "Comercial"}
                      </span>
                    </td>

                    <td className="p-4">{getRoleBadge(user.role)}</td>

                    <td className="p-4 text-center">
                      {user.status === "ativo" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400">
                          <XCircle className="w-3 h-3" /> Inativo
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
