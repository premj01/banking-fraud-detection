import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, ShoppingCart, ArrowLeftRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function TransactionRow({ transaction, onClick }) {
    const typeIcons = {
        transfer: ArrowLeftRight,
        card: CreditCard,
        withdrawal: Wallet,
        online_purchase: ShoppingCart,
    };

    const Icon = typeIcons[transaction.transaction_type];

    const statusConfig = {
        approved: { dot: 'bg-emerald-500', text: 'text-emerald-500' },
        declined: { dot: 'bg-red-500', text: 'text-red-500' },
        flagged: { dot: 'bg-amber-500', text: 'text-amber-500' },
    };

    const config = statusConfig[transaction.status];

    const getRiskColor = (score) => {
        if (score >= 0.7) return 'text-red-500 bg-red-500/10';
        if (score >= 0.4) return 'text-amber-500 bg-amber-500/10';
        return 'text-emerald-500 bg-emerald-500/10';
    };

    return (
        <div
            className="data-row flex items-center gap-4 p-4 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={onClick}
        >
            {/* Icon */}
            <div className="p-2 rounded-lg bg-muted/50">
                <Icon className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Transaction Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{transaction.transaction_id}</span>
                    <span className={cn("w-2 h-2 rounded-full", config.dot)} />
                </div>
                <p className="text-sm text-muted-foreground truncate">
                    {transaction.merchant_name} • {transaction.location.city}
                </p>
            </div>

            {/* Amount */}
            <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                    {transaction.transaction_type === 'withdrawal' ? (
                        <ArrowDownRight className="w-3 h-3 text-red-500" />
                    ) : (
                        <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="font-mono font-medium">
                        ₹{transaction.amount.toLocaleString()}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                </p>
            </div>

            {/* Risk Score */}
            <div className={cn(
                "px-3 py-1 rounded-full text-xs font-mono font-medium",
                getRiskColor(transaction.risk_score)
            )}>
                {(transaction.risk_score * 100).toFixed(0)}%
            </div>

            {/* Status */}
            <div className="w-20 text-right">
                <span className={cn("text-xs font-medium capitalize", config.text)}>
                    {transaction.status}
                </span>
            </div>
        </div>
    );
}
