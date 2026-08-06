import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
}

export function DashboardHeader({ title, subtitle, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-glow bg-emerald-glow/10 border border-emerald-glow/20 rounded-lg hover:bg-emerald-glow/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
        )}
      </div>
    </div>
  );
}
