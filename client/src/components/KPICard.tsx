import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export default function KPICard({ label, value, icon: Icon, color = "text-emerald-glow", trend, className }: KPICardProps) {
  return (
    <div className={cn("glass-card glass-card-hover p-5 transition-all duration-300", className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <span className="text-2xl font-bold font-mono text-foreground mt-1">{value}</span>
          {trend && (
            <span className={cn(
              "text-xs font-medium mt-1",
              trend.positive ? "text-emerald-glow" : "text-destructive"
            )}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </span>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg bg-[oklch(0.16_0.02_260/0.8)]", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
