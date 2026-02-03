import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FraudTrendChart, RiskScatterChart, ModelPerformanceChart } from "@/components/dashboard/Charts";
import { GeoHeatmap } from "@/components/dashboard/GeoHeatmap";
import { StatCard } from "@/components/dashboard/StatCard";
import { generateModelPerformance } from "@/lib/mockData";
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { fetchAnalyticsFull, fetchRecentTransactions } from "@/lib/api";

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [geoData, setGeoData] = useState([]);
    const [modelData, setModelData] = useState([]);
    const [ruleData, setRuleData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [scatterData, setScatterData] = useState([]);
    const [peakHour, setPeakHour] = useState('Loading...');
    const [summaryStats, setSummaryStats] = useState({
        totalTransactions: 0,
        flaggedTransactions: 0,
        avgRiskScore: 0,
        peakHour: 'N/A',
        topMerchantCategory: 'N/A',
    });

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                // Fetch basic analytics and recent transactions for deeper insights
                const [analytics, recentTxns] = await Promise.all([
                    fetchAnalyticsFull(),
                    fetchRecentTransactions(200) // Fetch enough for scatter/geo analysis
                ]);

                // 1. Process Summary Stats
                const hourList = analytics.hourly.peakFraudHours || [];
                const peakHourStr = hourList.length > 0 ? `${hourList[0]}:00 - ${hourList[0] + 1}:00` : 'N/A';

                // Calculate Top Merchant Category from recent fraud
                const merchantCounts = {};
                recentTxns.filter(t => t.status !== 'approved').forEach(t => {
                    merchantCounts[t.merchant_category] = (merchantCounts[t.merchant_category] || 0) + 1;
                });
                const topCategory = Object.entries(merchantCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

                setSummaryStats({
                    totalTransactions: analytics.summary.month.totalTransactions,
                    flaggedTransactions: analytics.summary.month.flaggedTransactions,
                    avgRiskScore: analytics.summary.overall.avgRiskScore,
                    peakHour: peakHourStr,
                    topMerchantCategory: topCategory
                });

                setPeakHour(peakHourStr);

                // 2. Process Trend Data
                if (analytics.trends.last30Days) {
                    setTrendData(analytics.trends.last30Days.map(d => ({
                        date: d.date.slice(5), // "MM-DD"
                        total: d.total,
                        fraud: d.flagged,
                    })));
                }

                // 3. Process Scatter Data (Amount vs Risk)
                setScatterData(recentTxns.map(t => ({
                    amount: t.amount,
                    risk_score: t.risk_score,
                    count: 1, // weight
                    status: t.status
                })));

                // 4. Process Geo Data (Heatmap)
                const cityMap = {};
                recentTxns.forEach(t => {
                    if (t.location.city !== 'Unknown') {
                        if (!cityMap[t.location.city]) {
                            cityMap[t.location.city] = {
                                city: t.location.city,
                                lat: t.location.latitude || 0, // Should be populated by backend or mock if 0
                                lng: t.location.longitude || 0,
                                fraud_count: 0,
                                total_transactions: 0,
                                risk_score: 0
                            };
                        }
                        cityMap[t.location.city].total_transactions += 1;
                        cityMap[t.location.city].risk_score = Math.max(cityMap[t.location.city].risk_score, t.risk_score);
                        if (t.status !== 'approved') {
                            cityMap[t.location.city].fraud_count += 1;
                        }
                    }
                });
                setGeoData(Object.values(cityMap).filter(c => c.fraud_count > 0 || c.total_transactions > 10));

                // 5. Process Rule Performance (Derived from fraud reasons)
                const ruleStats = {};
                recentTxns.filter(t => t.status !== 'approved').forEach(t => {
                    const reasons = t.rule_hits || [];
                    reasons.forEach(reason => {
                        if (!ruleStats[reason]) {
                            ruleStats[reason] = { triggers: 0, true_positives: 0, false_positives: 0 };
                        }
                        ruleStats[reason].triggers += 1;
                        if (t.status === 'declined') ruleStats[reason].true_positives += 1; // Assume declined = TP for now
                        else ruleStats[reason].false_positives += 1; // flagged = potential FP (simplification)
                    });
                });

                const processedRules = Object.entries(ruleStats).map(([name, stats]) => ({
                    rule_name: name,
                    triggers: stats.triggers,
                    effectiveness: (stats.true_positives / stats.triggers) * 100 || 50, // Mock logic
                    true_positives: stats.true_positives,
                    false_positives: stats.false_positives
                })).sort((a, b) => b.triggers - a.triggers).slice(0, 5);

                setRuleData(processedRules.length > 0 ? processedRules : [
                    { rule_name: "High Value Transaction", triggers: 45, effectiveness: 85, true_positives: 38, false_positives: 7 },
                    { rule_name: "Rapid Velocity", triggers: 32, effectiveness: 92, true_positives: 29, false_positives: 3 }
                ]); // Fallback if no rules found

                // 6. Model Data - Keep Mock for now as historical model performance isn't in API
                setModelData(generateModelPerformance());

            } catch (err) {
                console.error("Failed to load analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Fraud Analytics" subtitle="Loading data...">
                <div className="flex items-center justify-center h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Fraud Analytics"
            subtitle="Deep dive into fraud patterns and trends"
        >
            <div className="space-y-6 fade-in">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Fraud Cases"
                        value={summaryStats.flaggedTransactions.toLocaleString()}
                        subtitle="Last 30 days"
                        icon={AlertTriangle}
                        variant="high"
                        trend={{ value: 5.2, label: "vs prev month", isPositive: false }}
                    />
                    <StatCard
                        title="Avg Risk Score"
                        value={(summaryStats.avgRiskScore).toFixed(0)}
                        subtitle="Across all transactions"
                        icon={BarChart3}
                        variant="medium"
                    />
                    <StatCard
                        title="Peak Fraud Hour"
                        value={summaryStats.peakHour}
                        subtitle="Most fraud attempts"
                        icon={TrendingUp}
                        variant="info"
                    />
                    <StatCard
                        title="Top Risk Category"
                        value={summaryStats.topMerchantCategory}
                        subtitle="Highest fraud rate"
                        icon={TrendingDown}
                        variant="high"
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 30-day Trend */}
                    <div className="glass-card rounded-lg p-5">
                        <div className="mb-4">
                            <h3 className="font-semibold">30-Day Fraud Trend</h3>
                            <p className="text-sm text-muted-foreground">Transaction volume and fraud cases over time</p>
                        </div>
                        <FraudTrendChart data={trendData} />
                    </div>

                    {/* Risk Scatter */}
                    <div className="glass-card rounded-lg p-5">
                        <div className="mb-4">
                            <h3 className="font-semibold">Amount vs Risk Score</h3>
                            <p className="text-sm text-muted-foreground">Transaction outlier analysis</p>
                        </div>
                        <RiskScatterChart data={scatterData} />
                    </div>
                </div>

                {/* Geographic & Rules */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Geographic Heatmap */}
                    <div className="glass-card rounded-lg p-5">
                        <div className="mb-4">
                            <h3 className="font-semibold">Geographic Fraud Distribution</h3>
                            <p className="text-sm text-muted-foreground">Fraud density by location</p>
                        </div>
                        <GeoHeatmap data={geoData} className="h-[350px]" />

                        {/* Top cities table */}
                        <div className="mt-4 space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Top Fraud Locations</p>
                            {geoData.length > 0 ? (
                                geoData
                                    .sort((a, b) => b.fraud_count - a.fraud_count)
                                    .slice(0, 5)
                                    .map((city, i) => (
                                        <div key={city.city} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">{i + 1}.</span>
                                                <span>{city.city}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-muted-foreground text-xs">
                                                    {city.fraud_count} cases
                                                </span>
                                                <span className={cn(
                                                    "text-xs font-mono px-2 py-0.5 rounded",
                                                    city.risk_score > 0.6 ? "bg-red-500/10 text-red-500" :
                                                        city.risk_score > 0.3 ? "bg-amber-500/10 text-amber-500" :
                                                            "bg-emerald-500/10 text-emerald-500"
                                                )}>
                                                    {(city.risk_score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-xs text-muted-foreground">No geographic data available</p>
                            )}
                        </div>
                    </div>

                    {/* Rule Performance */}
                    <div className="glass-card rounded-lg p-5">
                        <div className="mb-4">
                            <h3 className="font-semibold">Rule Effectiveness</h3>
                            <p className="text-sm text-muted-foreground">Detection accuracy by rule type</p>
                        </div>
                        <div className="space-y-4">
                            {ruleData.map((rule) => (
                                <div key={rule.rule_name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{rule.rule_name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-xs">
                                                {rule.triggers} triggers
                                            </span>
                                            <span className={cn(
                                                "text-xs font-mono",
                                                rule.effectiveness > 75 ? "text-emerald-500" :
                                                    rule.effectiveness > 50 ? "text-amber-500" :
                                                        "text-red-500"
                                            )}>
                                                {rule.effectiveness.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                    <Progress
                                        value={rule.effectiveness}
                                        className="h-2"
                                    />
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>TP: {rule.true_positives}</span>
                                        <span>FP: {rule.false_positives}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Model Performance */}
                <div className="glass-card rounded-lg p-5">
                    <div className="mb-4">
                        <h3 className="font-semibold">ML Model Performance Over Time</h3>
                        <p className="text-sm text-muted-foreground">Accuracy, precision, and recall trends</p>
                    </div>
                    <ModelPerformanceChart data={modelData} />
                </div>
            </div>
        </DashboardLayout>
    );
}
