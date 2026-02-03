import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'high' | 'medium' | 'low' | 'info';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  const borderVariants = {
    default: '',
    high: 'stat-card-high',
    medium: 'stat-card-medium',
    low: 'stat-card-low',
    info: 'stat-card-info',
  };

  const iconVariants = {
    default: 'text-muted-foreground',
    high: 'text-risk-high',
    medium: 'text-risk-medium',
    low: 'text-risk-low',
    info: 'text-primary',
  };

  return (
    <div className={cn(
      "glass-card rounded-lg p-5 transition-all hover:bg-card/90",
      borderVariants[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="stat-number animate-count-up">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg bg-muted/50", iconVariants[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={cn(
            "font-medium",
            trend.isPositive ? "text-risk-low" : "text-risk-high"
          )}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
