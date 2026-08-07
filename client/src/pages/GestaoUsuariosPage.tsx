import React, { useState } from "react";
import { useAuth, User } from "@/contexts/AuthContext";
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
  const { usersList, currentUser, addUser, updateUser, deleteUser } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "attendant" as UserRole,
    department: "Comercial",
    supervisorName: "Carlos Eduardo",
    status: "ativo" as "ativo" | "inativo",
    avatarUrl: "",
  });

  const handleOpenNewModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "attendant",
      department: "Comercial",
      supervisorName: "Carlos Eduardo",
      status: "ativo",
      avatarUrl: "",
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "Comercial",
      supervisorName: user.supervisorName || "Carlos Eduardo",
      status: user.status,
      avatarUrl: user.avatarUrl || "",
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Preencha o nome e o e-mail do usuário.");
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast.success("Usuário atualizado com sucesso!");
    } else {
      addUser(formData);
      toast.success("Novo usuário criado com sucesso!");
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o usuário ${name}?`)) {
      deleteUser(id);
      toast.success("Usuário removido.");
    }
  };

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
            <Shield className="w-3 h-3" />
            Administrador
          </span>
        );
      case "supervisor":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Building2 className="w-3 h-3" />
            Supervisor
          </span>
        );
      case "attendant":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <UserIcon className="w-3 h-3" />
            Atendente
          </span>
        );
      case "viewer":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Eye className="w-3 h-3" />
            Visualizador
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-glow" />
            Gestão de Usuários & Controle de Acesso
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cadastre novos colaboradores, defina seus perfis (Admin, Supervisor, Atendente, Visualizador) e departamentos.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          + Novo Usuário
        </button>
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
            placeholder="Buscar por nome, e-mail ou departamento..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-glow/60"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Perfil:
          </span>
          {[
            { id: "all", label: "Todos" },
            { id: "admin", label: "Admins" },
            { id: "supervisor", label: "Supervisores" },
            { id: "attendant", label: "Atendentes" },
            { id: "viewer", label: "Visualizadores" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === tab.id
                  ? "bg-emerald-glow/20 text-emerald-glow font-bold border border-emerald-glow/30"
                  : "bg-[oklch(0.16_0.02_260)] text-muted-foreground hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                <th className="p-4">Supervisor Responsável</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Último Acesso</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-foreground">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">
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

                    <td className="p-4 text-muted-foreground">{user.supervisorName || "-"}</td>

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

                    <td className="p-4 text-muted-foreground text-[11px]">{user.lastAccess}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo / Editar Usuário */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-glow" />
                {editingUser ? "Editar Usuário" : "+ Cadastrar Novo Usuário"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white focus:outline-none focus:border-emerald-glow"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@datacrazy.com"
                    className="w-full px-3 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white focus:outline-none focus:border-emerald-glow"
                  />
                </div>

                {/* Cargo / Perfil */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Cargo / Perfil de Acesso</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white focus:outline-none focus:border-emerald-glow"
                  >
                    <option value="admin">Administrador (Acesso Total)</option>
                    <option value="supervisor">Supervisor (Departamento)</option>
                    <option value="attendant">Atendente (Leads Próprios)</option>
                    <option value="viewer">Visualizador (Apenas Leitura)</option>
                  </select>
                </div>

                {/* Departamento */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Departamento</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white focus:outline-none focus:border-emerald-glow"
                  >
                    <option value="Comercial">Comercial</option>
                    <option value="Vendas Direct">Vendas Direct</option>
                    <option value="Suporte">Suporte</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Diretoria">Diretoria</option>
                  </select>
                </div>

                {/* Supervisor Responsável */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Supervisor Responsável</label>
                  <input
                    type="text"
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full px-3 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white focus:outline-none focus:border-emerald-glow"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Status do Usuário</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "ativo" | "inativo" })}
                    className="w-full px-3 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white focus:outline-none focus:border-emerald-glow"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-muted-foreground hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {editingUser ? "Salvar Alterações" : "Cadastrar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
