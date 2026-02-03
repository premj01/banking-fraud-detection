import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TransactionRow } from "@/components/dashboard/TransactionRow";
import { VolumeBarChart } from "@/components/dashboard/Charts";
import { generateHourlyData } from "@/lib/mockData";
import { fetchRecentTransactions, fetchHourlyAnalytics, transformTransaction } from "@/lib/api";
import socket from "@/lib/socket";
import { Play, Pause, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useNavigate } from "react-router-dom";

const MAX_TRANSACTIONS = 20;

export default function Monitoring() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [isLive, setIsLive] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hourlyVolume, setHourlyVolume] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);

    // Load initial transactions and analytics from API
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Parallel fetch
            const [txnsData, analyticsData] = await Promise.all([
                fetchRecentTransactions(MAX_TRANSACTIONS),
                fetchHourlyAnalytics().catch(err => {
                    console.error('Failed to load analytics:', err);
                    return { hourlyVolume: [] };
                })
            ]);

            setTransactions(txnsData);
            setHourlyVolume(analyticsData.hourlyVolume);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Socket.IO connection and real-time updates
    useEffect(() => {
        // Connection status handlers
        const onConnect = () => {
            console.log('🔌 Socket connected for real-time monitoring');
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        };

        // Real-time transaction handler
        const onRealTimeStream = (data) => {
            if (!isLive) return;

            console.log('📨 New transaction received:', data.transaction?.transaction_id);
            const transformedTxn = transformTransaction(data);

            setTransactions(prev => {
                // Add new transaction at the beginning and keep only MAX_TRANSACTIONS
                const updated = [transformedTxn, ...prev];
                return updated.slice(0, MAX_TRANSACTIONS);
            });
        };

        // Register event listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('real-time-stream', onRealTimeStream);

        // Connect if not already connected
        if (!socket.connected) {
            socket.connect();
        }

        // Cleanup
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('real-time-stream', onRealTimeStream);
        };
    }, [isLive]);

    // Handle pause/resume
    const toggleLive = useCallback(() => {
        setIsLive(prev => !prev);
    }, []);

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
                            onClick={toggleLive}
                        >
                            {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {isLive ? 'Pause Feed' : 'Resume Feed'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadData}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {isLive && isConnected && (
                            <Badge variant="outline" className="animate-pulse text-emerald-500 border-emerald-500">
                                • Live Connected
                            </Badge>
                        )}
                        {isLive && !isConnected && (
                            <Badge variant="outline" className="text-amber-500 border-amber-500">
                                • Connecting...
                            </Badge>
                        )}
                        {!isLive && (
                            <Badge variant="outline" className="text-gray-500 border-gray-500">
                                • Paused
                            </Badge>
                        )}
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter Stream
                    </Button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
                        <p className="text-sm font-medium">Failed to load transactions: {error}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={loadData}
                            className="mt-2 text-red-500 hover:text-red-400"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

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
                    <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                        <h3 className="font-semibold">Live Transactions</h3>
                        <span className="text-sm text-muted-foreground">
                            {transactions.length} / {MAX_TRANSACTIONS} shown
                        </span>
                    </div>
                    <div className="divide-y divide-border/50">
                        {isLoading && transactions.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p>Loading transactions...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <p>No transactions yet. Waiting for incoming data...</p>
                            </div>
                        ) : (
                            transactions.map((txn) => (
                                <TransactionRow
                                    key={txn.transaction_id}
                                    transaction={txn}
                                    onClick={() => navigate(`/drilldown?txn=${txn.transaction_id}`, {
                                        state: { transaction: txn }
                                    })}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
