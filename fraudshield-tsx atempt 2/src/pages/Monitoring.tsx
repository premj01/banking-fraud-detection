import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TransactionRow } from "@/components/dashboard/TransactionRow";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { VolumeBarChart, Sparkline } from "@/components/dashboard/Charts";
import { generateTransactions, generateFraudAlerts, generateHourlyData } from "@/lib/mockData";
import { Transaction, FraudAlert } from "@/types/fraud";
import { Activity, AlertTriangle, CheckCircle, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Monitoring() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'approved' | 'declined'>('all');
  const [isLive, setIsLive] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalToday: 0,
    approvedCount: 0,
    flaggedCount: 0,
    declinedCount: 0,
    tps: 0,
  });

  const loadData = useCallback(() => {
    const txns = generateTransactions(50);
    setTransactions(txns);
    setAlerts(generateFraudAlerts(10).filter(a => a.status !== 'Closed'));
    setVolumeData(generateHourlyData(400, 150));

    setStats({
      totalToday: txns.length * 180,
      approvedCount: txns.filter(t => t.status === 'approved').length * 180,
      flaggedCount: txns.filter(t => t.status === 'flagged').length * 180,
      declinedCount: txns.filter(t => t.status === 'declined').length * 180,
      tps: Math.floor(Math.random() * 50) + 30,
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTransactions(prev => {
        const newTxn = generateTransactions(1)[0];
        return [newTxn, ...prev.slice(0, 49)];
      });
      setStats(prev => ({
        ...prev,
        totalToday: prev.totalToday + 1,
        tps: Math.floor(Math.random() * 50) + 30,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const sparklineData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 50);

  return (
    <DashboardLayout 
      title="Real-Time Monitoring" 
      subtitle="Live transaction feed and instant alerts"
    >
      <div className="space-y-6 fade-in">
        {/* Top Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Today</p>
                <p className="text-2xl font-mono font-bold">{stats.totalToday.toLocaleString()}</p>
              </div>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <Sparkline data={sparklineData} color="primary" className="mt-2" />
          </div>

          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-mono font-bold text-risk-low">{stats.approvedCount.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-risk-low" />
            </div>
          </div>

          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Flagged</p>
                <p className="text-2xl font-mono font-bold text-risk-medium">{stats.flaggedCount.toLocaleString()}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-risk-medium" />
            </div>
          </div>

          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Declined</p>
                <p className="text-2xl font-mono font-bold text-risk-high">{stats.declinedCount.toLocaleString()}</p>
              </div>
              <XCircle className="w-5 h-5 text-risk-high" />
            </div>
          </div>

          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current TPS</p>
                <p className="text-2xl font-mono font-bold">{stats.tps}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-risk-low animate-pulse' : 'bg-muted'}`} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Transaction Feed */}
          <div className="lg:col-span-3 glass-card rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Transaction Feed</h3>
                {isLive && (
                  <Badge variant="outline" className="text-risk-low border-risk-low/30 bg-risk-low/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-risk-low mr-1.5 animate-pulse" />
                    Live
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Filter buttons */}
                <div className="flex bg-muted/50 rounded-lg p-1">
                  {(['all', 'flagged', 'approved', 'declined'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                        filter === f 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsLive(!isLive)}
                >
                  {isLive ? 'Pause' : 'Resume'}
                </Button>
              </div>
            </div>

            {/* Transaction list */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredTransactions.map((txn, index) => (
                <div 
                  key={txn.transaction_id}
                  className={index === 0 && isLive ? 'slide-in-left' : ''}
                >
                  <TransactionRow 
                    transaction={txn}
                    onClick={() => navigate(`/drilldown?txn=${txn.transaction_id}`)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Sidebar */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Active Alerts</h3>
                <Badge variant="destructive" className="text-xs">
                  {alerts.length}
                </Badge>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <AlertItem 
                    key={alert.alert_id} 
                    alert={alert} 
                    compact 
                    onClick={() => navigate(`/drilldown?alert=${alert.alert_id}`)}
                  />
                ))}
              </div>
            </div>

            {/* Mini Volume Chart */}
            <div className="glass-card rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-4">Hourly Volume</h3>
              <VolumeBarChart data={volumeData} className="h-[200px]" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
