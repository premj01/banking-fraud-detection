import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TransactionRow } from "@/components/dashboard/TransactionRow";
import { VolumeBarChart } from "@/components/dashboard/Charts";
import { generateTransaction, generateHourlyData } from "@/lib/mockData";
import { Play, Pause, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useNavigate } from "react-router-dom";

export default function Monitoring() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [isLive, setIsLive] = useState(true);
    const [hourlyVolume, setHourlyVolume] = useState([]);

    // Initial load
    useEffect(() => {
        const initial = Array.from({ length: 15 }, () => generateTransaction());
        setTransactions(initial);
        setHourlyVolume(generateHourlyData(500, 150));
    }, []);

    // Live feed simulation
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            const newTxn = generateTransaction({
                timestamp: new Date().toISOString(),
            });
            setTransactions(prev => [newTxn, ...prev].slice(0, 50));
        }, 2000);

        return () => clearInterval(interval);
    }, [isLive]);

    return (
        <DashboardLayout
            title="Real-Time Monitoring"
            subtitle="Live transaction feed and velocity analysis"
        >
            <div className="space-y-6 fade-in">
                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isLive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => setIsLive(!isLive)}
                        >
                            {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {isLive ? 'Pause Feed' : 'Resume Feed'}
                        </Button>
                        {isLive && (
                            <Badge variant="outline" className="animate-pulse text-emerald-500 border-emerald-500">
                                • Live Incoming
                            </Badge>
                        )}
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter Stream
                    </Button>
                </div>

                {/* Volume Chart */}
                <div className="glass-card rounded-lg p-5">
                    <div className="mb-4">
                        <h3 className="font-semibold">Hourly Transaction Volume</h3>
                        <p className="text-sm text-muted-foreground">Transaction throughput over last 24h</p>
                    </div>
                    <VolumeBarChart data={hourlyVolume} className="h-[200px]" />
                </div>

                {/* Transaction Feed */}
                <div className="glass-card rounded-lg overflow-hidden border border-border/50">
                    <div className="p-4 border-b border-border/50 bg-muted/20">
                        <h3 className="font-semibold">Live Transactions</h3>
                    </div>
                    <div className="divide-y divide-border/50">
                        {transactions.map((txn) => (
                            <TransactionRow
                                key={txn.transaction_id}
                                transaction={txn}
                                onClick={() => navigate(`/drilldown?txn=${txn.transaction_id}`)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
