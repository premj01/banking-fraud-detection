import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AlertItem({ alert, onClick, compact = false }) {
    const severityConfig = {
        Critical: {
            icon: XCircle,
            bgClass: 'bg-red-500/5',
            borderClass: 'border-l-red-500',
            iconClass: 'text-red-500',
            glowClass: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]',
        },
        High: {
            icon: AlertTriangle,
            bgClass: 'bg-orange-500/5',
            borderClass: 'border-l-orange-500',
            iconClass: 'text-orange-500',
            glowClass: '',
        },
        Medium: {
            icon: AlertCircle,
            bgClass: 'bg-amber-500/5',
            borderClass: 'border-l-amber-500',
            iconClass: 'text-amber-500',
            glowClass: '',
        },
        Low: {
            icon: Info,
            bgClass: 'bg-blue-500/5',
            borderClass: 'border-l-blue-500',
            iconClass: 'text-blue-500',
            glowClass: '',
        },
    };

    const severityKey = alert.severity ? alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1).toLowerCase() : 'Medium';
    const config = severityConfig[severityKey] || severityConfig['Medium'];
    const Icon = config.icon;

    const statusColors = {
        'Open': 'bg-red-500 text-white',
        'Under Review': 'bg-amber-500 text-black',
        'Escalated': 'bg-purple-500 text-white',
        'Closed': 'bg-muted text-muted-foreground',
    };

    if (compact) {
        return (
            <div
                className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:bg-muted/30 border border-t-0 border-b-0 border-r-0",
                    config.borderClass,
                    config.bgClass,
                    alert.severity === 'Critical' && config.glowClass
                )}
                onClick={onClick}
            >
                <Icon className={cn("w-4 h-4 shrink-0", config.iconClass)} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.alert_type}</p>
                    <p className="text-xs text-muted-foreground">
                        ₹{alert.amount.toLocaleString()} • {formatDistanceToNow(new Date(alert.timestamp || new Date()), { addSuffix: true })}
                    </p>
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusColors[alert.status])}>
                    {alert.status}
                </span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:bg-muted/30 border border-t-0 border-b-0 border-r-0",
                config.borderClass,
                config.bgClass,
                alert.severity === 'Critical' && config.glowClass
            )}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconClass)} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium">{alert.alert_type}</h4>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[alert.status])}>
                            {alert.status}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Amount: ₹{alert.amount.toLocaleString()}</span>
                        <span>ID: {alert.transaction_id}</span>
                        <span>{formatDistanceToNow(new Date(alert.timestamp || new Date()), { addSuffix: true })}</span>
                    </div>
                    {alert.rule_triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {alert.rule_triggers.slice(0, 2).map((rule, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                                    {rule.length > 40 ? rule.substring(0, 40) + '...' : rule}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
