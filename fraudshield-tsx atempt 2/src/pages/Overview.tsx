import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { TransactionRow } from "@/components/dashboard/TransactionRow";
import { FraudTrendChart, RiskDistributionChart, VolumeBarChart } from "@/components/dashboard/Charts";
import { GeoHeatmap } from "@/components/dashboard/GeoHeatmap";
import { 
  generateDashboardStats, 
  generateFraudAlerts, 
  generateTransactions,
  generateGeoHeatmapData,
  generateTimeSeriesData,
  generateHourlyData,
} from "@/lib/mockData";
import { DashboardStats, FraudAlert, Transaction, GeoHeatmapData } from "@/types/fraud";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign,
  AlertTriangle,
  Activity,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Overview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [geoData, setGeoData] = useState<GeoHeatmapData[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate data loading
    setStats(generateDashboardStats());
    setAlerts(generateFraudAlerts(8).filter(a => a.status !== 'Closed'));
    setTransactions(generateTransactions(10));
    setGeoData(generateGeoHeatmapData());
    
    // Generate trend data
    const rawTrend = generateTimeSeriesData(14, 500, 150);
    setTrendData(rawTrend.map(d => ({
      date: d.date.slice(5), // MM-DD format
      total: d.value * 20,
      fraud: Math.floor(d.value * 0.05),
    })));

    // Generate volume data
    setVolumeData(generateHourlyData(400, 150));
  }, []);

  const riskDistribution = [
    { name: 'High Risk', value: 127 },
    { name: 'Medium Risk', value: 342 },
    { name: 'Low Risk', value: 8531 },
  ];

  if (!stats) return null;

  return (
    <DashboardLayout 
      title="Fraud Monitoring Overview" 
      subtitle="Real-time transaction monitoring and fraud detection"
    >
      <div className="space-y-6 fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Transactions Today"
            value={stats.transactions_today.toLocaleString()}
            subtitle={`${stats.total_transactions.toLocaleString()} this month`}
            icon={Activity}
            variant="info"
            trend={{ value: 12.5, label: "vs yesterday", isPositive: true }}
          />
          <StatCard
            title="Flagged Transactions"
            value={stats.flagged_transactions}
            subtitle={`${stats.open_alerts} open alerts`}
            icon={ShieldAlert}
            variant="high"
            trend={{ value: 8.2, label: "vs avg", isPositive: false }}
          />
          <StatCard
            title="Fraud Detection Rate"
            value={`${stats.fraud_detection_rate.toFixed(1)}%`}
            subtitle={`${stats.false_positive_rate.toFixed(1)}% false positives`}
            icon={Target}
            variant="low"
            trend={{ value: 2.1, label: "improvement", isPositive: true }}
          />
          <StatCard
            title="Losses Prevented"
            value={`₹${(stats.losses_prevented / 100000).toFixed(1)}L`}
            subtitle={`₹${(stats.actual_losses / 100000).toFixed(1)}L actual losses`}
            icon={ShieldCheck}
            variant="low"
            trend={{ value: 15.3, label: "vs last month", isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fraud Trend */}
          <div className="lg:col-span-2 glass-card rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Transaction & Fraud Trend</h3>
                <p className="text-sm text-muted-foreground">Last 14 days</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-primary rounded" />
                  <span className="text-muted-foreground">Total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-risk-high rounded" />
                  <span className="text-muted-foreground">Flagged</span>
                </div>
              </div>
            </div>
            <FraudTrendChart data={trendData} />
          </div>

          {/* Risk Distribution */}
          <div className="glass-card rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Risk Distribution</h3>
              <p className="text-sm text-muted-foreground">Today's transactions</p>
            </div>
            <RiskDistributionChart data={riskDistribution} />
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Alerts */}
          <div className="glass-card rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Live Alerts</h3>
                <p className="text-sm text-muted-foreground">{alerts.length} active alerts</p>
              </div>
              <button 
                className="text-xs text-primary hover:underline"
                onClick={() => navigate('/alerts')}
              >
                View all
              </button>
            </div>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-2">
              {alerts.slice(0, 5).map((alert) => (
                <AlertItem key={alert.alert_id} alert={alert} compact />
              ))}
            </div>
          </div>

          {/* Transaction Volume */}
          <div className="glass-card rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Hourly Volume</h3>
              <p className="text-sm text-muted-foreground">Transaction activity today</p>
            </div>
            <VolumeBarChart data={volumeData} className="h-[280px]" />
          </div>

          {/* Geographic Heatmap */}
          <div className="glass-card rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Fraud Heatmap</h3>
              <p className="text-sm text-muted-foreground">Geographic distribution</p>
            </div>
            <GeoHeatmap data={geoData} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <div>
              <h3 className="font-semibold">Recent Transactions</h3>
              <p className="text-sm text-muted-foreground">Latest flagged and high-value transactions</p>
            </div>
            <button 
              className="text-xs text-primary hover:underline"
              onClick={() => navigate('/monitoring')}
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {transactions.slice(0, 6).map((txn) => (
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
