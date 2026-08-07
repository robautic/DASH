import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  BarChart3, 
  MessageSquare,
  Radio,
  RefreshCw,
  Settings,
  Target,
  Filter,
  Building2,
  TrendingUp,
  LogOut,
  Shield,
  Eye,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { currentUser, logout } = useAuth();

  const navItems = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { id: "supervisor", label: "Painel Supervisor", icon: TrendingUp },
    { id: "atendente_dash", label: "Meu Painel Atendente", icon: UserIcon },
    { id: "atendentes", label: "Atendentes & Metas", icon: Users },
    { id: "leads", label: "Leads Profissionais", icon: MessageSquare },
    { id: "departamentos", label: "Departamentos", icon: Building2 },
    { id: "pipeline", label: "Pipeline & Funil", icon: GitBranch },
    { id: "usuarios", label: "Gestão de Usuários", icon: Shield, adminOnly: true },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ];

  const getRoleLabel = () => {
    switch (currentUser?.role) {
      case "admin":
        return "Administrador";
      case "supervisor":
        return `Supervisor (${currentUser.department || "Comercial"})`;
      case "attendant":
        return `Atendente (${currentUser.name})`;
      case "viewer":
        return "Visualizador";
      default:
        return "Usuário";
    }
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[oklch(0.12_0.02_260)] border-r border-[oklch(0.3_0.02_260/0.4)] flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-[oklch(0.3_0.02_260/0.4)]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground tracking-tight">Sigma Assessoria</span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Gestão & Distribuição</span>
        </div>
      </div>

      {/* User Badge */}
      {currentUser && (
        <div className="p-3 mx-3 mt-3 rounded-xl bg-[oklch(0.16_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-glow flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
              <span className="text-[10px] text-emerald-glow truncate font-medium">{getRoleLabel()}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Sair do sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && currentUser?.role !== "admin") return null;

          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-[oklch(0.72_0.19_160/0.15)] text-emerald-glow font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.2_0.02_260/0.5)]"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", isActive && "text-emerald-glow")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Live Status Bar */}
      <div className="p-4 border-t border-[oklch(0.3_0.02_260/0.4)]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-glow animate-spin" style={{ animationDuration: "12s" }} />
          <span>DataCrazy API (Tempo Real)</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-glow pulse-indicator" />
          <span className="text-[11px] text-emerald-glow font-medium">Sincronizado • 30s</span>
        </div>
      </div>
    </aside>
  );
}
