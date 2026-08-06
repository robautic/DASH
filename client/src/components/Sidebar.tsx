import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  BarChart3, 
  MessageSquare,
  Radio,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "atendentes", label: "Atendentes", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "leads", label: "Leads", icon: MessageSquare },
  { id: "conexoes", label: "Conexões", icon: Radio },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[oklch(0.12_0.02_260)] border-r border-[oklch(0.3_0.02_260/0.4)] flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-[oklch(0.3_0.02_260/0.4)]">
        <img 
          src="/manus-storage/logo-icon_43d5fc39.png" 
          alt="Logo" 
          className="w-9 h-9 rounded-lg object-contain"
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground tracking-tight">Next Leads</span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Distribuição Inteligente</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[oklch(0.72_0.19_160/0.15)] text-emerald-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.2_0.02_260/0.5)]"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", isActive && "text-emerald-glow")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Status Bar */}
      <div className="p-4 border-t border-[oklch(0.3_0.02_260/0.4)]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-glow" />
          <span>Conectado ao n8n</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-glow pulse-indicator" />
          <span className="text-[11px] text-emerald-glow font-medium">Online</span>
        </div>
      </div>
    </aside>
  );
}
