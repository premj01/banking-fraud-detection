import { cn } from "@/lib/utils";

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = 'default',
    className
}) {
    const borderVariants = {
        default: '',
        high: 'border-l-4 border-l-red-500',
        medium: 'border-l-4 border-l-amber-500',
        low: 'border-l-4 border-l-emerald-500',
        info: 'border-l-4 border-l-blue-500',
    };

    const iconVariants = {
        default: 'text-muted-foreground',
        high: 'text-red-500',
        medium: 'text-amber-500',
        low: 'text-emerald-500',
        info: 'text-blue-500',
    };

    return (
        <div className={cn(
            "card-gradient rounded-lg p-5 transition-all hover:shadow-lg border border-border/50",
            borderVariants[variant],
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
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
                        "font-medium px-1.5 py-0.5 rounded",
                        trend.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </span>
                    <span className="text-muted-foreground ml-1">{trend.label}</span>
                </div>
            )}
        </div>
    );
}
