import { useState } from "react";
import { Search, Bell, Shield, User, ChevronDown, Clock, Eye, Building2 } from "lucide-react";
import { UserRole } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface GlobalTopBarProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSelectLeadById?: (leadId: string) => void;
}

export function GlobalTopBar({ userRole, onRoleChange }: GlobalTopBarProps) {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const mockSlaAlerts = [
    { id: "1", leadName: "Valeska Souza", timeOverdue: "18 min", attendant: "Ana Carol" },
    { id: "2", leadName: "Marcos Ribeiro", timeOverdue: "24 min", attendant: "Bruno Costa" },
    { id: "3", leadName: "Fernanda Lima", timeOverdue: "12 min", attendant: "Camila Rocha" },
  ];

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "supervisor":
        return "Supervisor";
      case "attendant":
        return "Atendente";
      case "viewer":
        return "Visualizador";
    }
  };

  return (
    <header className="h-14 border-b border-[oklch(0.3_0.02_260/0.4)] bg-[oklch(0.12_0.02_260)] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-72 sm:w-96">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar lead por nome, e-mail, telefone..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-[oklch(0.16_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-lg text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-emerald-glow/50"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* SLA Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-[oklch(0.2_0.02_260/0.5)] text-muted-foreground hover:text-foreground relative transition-colors cursor-pointer"
            title="Alertas de SLA"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 glass-card p-4 space-y-3 z-50 border border-red-500/30 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  Alertas de SLA Excedido ({mockSlaAlerts.length})
                </span>
                <span className="text-[10px] text-muted-foreground">Tempo &gt; 15 min</span>
              </div>
              <div className="space-y-2">
                {mockSlaAlerts.map((alert) => (
                  <div key={alert.id} className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-xs space-y-0.5">
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>{alert.leadName}</span>
                      <span className="text-red-400 font-mono text-[10px]">+{alert.timeOverdue}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Atendente: {alert.attendant}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Role Selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[oklch(0.16_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] text-xs font-medium text-foreground hover:bg-[oklch(0.2_0.02_260)] transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-glow" />
            <span className="capitalize">{getRoleDisplay(userRole)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 top-10 w-52 glass-card p-1.5 space-y-1 z-50 border border-[oklch(0.3_0.02_260/0.4)] shadow-xl animate-in fade-in">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Alternar Perfil de Acesso
              </div>

              <button
                onClick={() => {
                  onRoleChange("admin");
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
                  userRole === "admin" ? "bg-emerald-glow/15 text-emerald-glow font-bold" : "text-foreground hover:bg-white/5"
                }`}
              >
                <Shield className="w-3 h-3" />
                Administrador (Empresa Inteira)
              </button>

              <button
                onClick={() => {
                  onRoleChange("supervisor");
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
                  userRole === "supervisor" ? "bg-blue-500/15 text-blue-400 font-bold" : "text-foreground hover:bg-white/5"
                }`}
              >
                <Building2 className="w-3 h-3" />
                Supervisor (Seu Departamento)
              </button>

              <button
                onClick={() => {
                  onRoleChange("attendant");
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
                  userRole === "attendant" ? "bg-purple-500/15 text-purple-400 font-bold" : "text-foreground hover:bg-white/5"
                }`}
              >
                <User className="w-3 h-3" />
                Atendente (Apenas Seus Leads)
              </button>

              <button
                onClick={() => {
                  onRoleChange("viewer");
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
                  userRole === "viewer" ? "bg-amber-500/15 text-amber-400 font-bold" : "text-foreground hover:bg-white/5"
                }`}
              >
                <Eye className="w-3 h-3" />
                Visualizador (Apenas Leitura)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
