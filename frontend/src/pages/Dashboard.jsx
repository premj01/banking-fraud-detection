import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { FraudTrendChart, RiskDistributionChart } from "@/components/dashboard/Charts";
import { GeoHeatmap } from "@/components/dashboard/GeoHeatmap";
import { AlertItem } from "@/components/dashboard/AlertItem";
import {
  generateDashboardStats,
  generateTimeSeriesData,
  generateGeoHeatmapData,
  generateFraudAlerts
} from "@/lib/mockData";
import { Shield, Activity, AlertTriangle, Search } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    setStats(generateDashboardStats());

    const rawTrend = generateTimeSeriesData(14, 10000, 2000);
    setTrendData(rawTrend.map(d => ({
      date: d.date.slice(5),
      total: d.value,
      fraud: Math.floor(d.value * 0.02)
    })));

    setGeoData(generateGeoHeatmapData());
    setRecentAlerts(generateFraudAlerts(3));
  }, []);

  if (!stats) return null;

  const riskDistribution = [
    { name: 'High Risk', value: 12 },
    { name: 'Medium Risk', value: 25 },
    { name: 'Low Risk', value: 63 },
  ];

  return (
    <DashboardLayout
      title="Fraud Monitoring Overview"
      subtitle="Real-time transaction monitoring and fraud detection"
    >
      <div className="space-y-6 fade-in">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Transactions Today"
            value={stats.transactions_today.toLocaleString()}
            subtitle="220,133 this month"
            icon={Activity}
            trend={{ value: 12.5, label: "vs yesterday", isPositive: true }}
            variant="info"
          />
          <StatCard
            title="Flagged Transactions"
            value={stats.flagged_transactions.toLocaleString()}
            subtitle={`${stats.open_alerts} open alerts`}
            icon={Shield}
            trend={{ value: 8.2, label: "vs avg", isPositive: false }}
            variant="high"
          />
          <StatCard
            title="Fraud Detection Rate"
            value={`${stats.fraud_detection_rate.toFixed(1)}%`}
            subtitle={`${stats.false_positive_rate.toFixed(1)}% false positives`}
            icon={Search}
            trend={{ value: 2.1, label: "improvement", isPositive: true }}
            variant="low"
          />
          <StatCard
            title="Losses Prevented"
            value={`₹${(stats.losses_prevented / 100000).toFixed(1)}L`}
            subtitle={`₹${(stats.actual_losses / 100000).toFixed(1)}L actual losses`}
            icon={Shield}
            trend={{ value: 15.3, label: "vs last month", isPositive: true }}
            variant="low"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Transaction & Fraud Trend</h3>
              <p className="text-sm text-muted-foreground">Last 14 days</p>
            </div>
            <FraudTrendChart data={trendData} />
          </div>
          <div className="glass-card rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Risk Distribution</h3>
              <p className="text-sm text-muted-foreground">Today's transactions</p>
            </div>
            <RiskDistributionChart data={riskDistribution} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Live Alerts</h3>
                <p className="text-sm text-muted-foreground">Recent high-priority detections</p>
              </div>
              <button className="text-xs text-primary hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {recentAlerts.map(alert => (
                <AlertItem key={alert.alert_id} alert={alert} compact />
              ))}
            </div>
          </div>

          <div className="glass-card rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Fraud Heatmap</h3>
              <p className="text-sm text-muted-foreground">Geographic distribution of flagged events</p>
            </div>
            <GeoHeatmap data={geoData} className="h-[250px]" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
