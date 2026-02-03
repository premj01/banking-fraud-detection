import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { FraudTrendChart, RiskDistributionChart } from "@/components/dashboard/Charts";
import { GeoHeatmap } from "@/components/dashboard/GeoHeatmap";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { fetchAnalyticsSummary, fetchAnalyticsTrends, fetchRecentTransactions } from "@/lib/api";
import { generateGeoHeatmapData } from "@/lib/mockData";
import { Shield, Activity, AlertTriangle, Search } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [summaryData, trendsData, recentTxns] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchAnalyticsTrends(),
          fetchRecentTransactions(100) // Fetch more for better distribution accuracy
        ]);

        // Map Summary Data
        setStats({
          transactions_today: summaryData.today.totalTransactions,
          flagged_transactions: summaryData.today.flaggedTransactions,
          open_alerts: summaryData.today.openAlerts,
          fraud_detection_rate: summaryData.today.fraudDetectionRate,
          false_positive_rate: 1.2,
          losses_prevented: summaryData.today.lossesPrevented,
          actual_losses: summaryData.month.flaggedAmount
        });

        // Map Trend Data
        setTrendData(trendsData.last30Days.map(d => ({
          date: d.date.slice(5),
          total: d.total,
          fraud: d.flagged
        })));

        // Calculate Risk Distribution
        let high = 0, medium = 0, low = 0;
        recentTxns.forEach(t => {
          const score = t.risk_score || 0;
          if (score > 0.8) high++;
          else if (score > 0.3) medium++;
          else low++;
        });
        const total = recentTxns.length || 1;
        setRiskDistribution([
          { name: 'High Risk', value: Math.round((high / total) * 100) },
          { name: 'Medium Risk', value: Math.round((medium / total) * 100) },
          { name: 'Low Risk', value: Math.round((low / total) * 100) },
        ]);

        // Map Recent Alerts (Filter for fraud/flagged)
        const alerts = recentTxns
          .filter(txn => txn.status === 'declined' || txn.status === 'flagged')
          .slice(0, 3)
          .map(txn => ({
            alert_id: txn.transaction_id,
            severity: txn.risk_score > 0.8 ? 'critical' : 'high',
            message: `Suspicious ${txn.transaction_type} detected`,
            timestamp: txn.timestamp,
            amount: txn.amount
          }));
        setRecentAlerts(alerts);

        // Keep Geo mock for now or use recent txns locations
        // setGeoData(generateGeoHeatmapData()); 
        // Let's try to map locations from recent transactions if available
        const locations = recentTxns
          .filter(t => t.location && t.location.city !== 'Unknown')
          .map(t => ({
            city: t.location.city,
            lat: t.location.latitude,
            lng: t.location.longitude,
            fraud_count: t.status !== 'approved' ? 1 : 0,
            risk_score: t.risk_score
          }));

        if (locations.length > 0) {
          // Group by city simple aggregation
          const cityMap = {};
          locations.forEach(l => {
            if (!cityMap[l.city]) {
              cityMap[l.city] = { ...l, fraud_count: 0, total_transactions: 0 };
            }
            cityMap[l.city].total_transactions += 1;
            if (l.fraud_count > 0) cityMap[l.city].fraud_count += 1;
            cityMap[l.city].risk_score = Math.max(cityMap[l.city].risk_score, l.risk_score);
          });
          setGeoData(Object.values(cityMap).filter(c => c.fraud_count > 0));
        } else {
          setGeoData(generateGeoHeatmapData());
        }

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (!stats) return null;



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
