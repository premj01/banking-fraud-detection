import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FraudTrendChart, RiskScatterChart, ModelPerformanceChart } from "@/components/dashboard/Charts";
import { GeoHeatmap } from "@/components/dashboard/GeoHeatmap";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    generateGeoHeatmapData,
    generateModelPerformance,
    generateRulePerformance,
    generateTimeSeriesData,
    generateTransactions,
} from "@/lib/mockData";
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Analytics() {
    const [geoData, setGeoData] = useState([]);
    const [modelData, setModelData] = useState([]);
    const [ruleData, setRuleData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [scatterData, setScatterData] = useState([]);

    useEffect(() => {
        setGeoData(generateGeoHeatmapData());
        setModelData(generateModelPerformance());
        setRuleData(generateRulePerformance());

        // Trend data for last 30 days
        const rawTrend = generateTimeSeriesData(30, 400, 100);
        setTrendData(rawTrend.map(d => ({
            date: d.date.slice(5),
            total: d.value * 25,
            fraud: Math.floor(d.value * 0.04),
        })));

        // Scatter data for risk analysis
        const txns = generateTransactions(100);
        setScatterData(txns.map(t => ({
            amount: t.amount,
            risk_score: t.risk_score,
            count: 1,
        })));
    }, []);

    const summaryStats = {
        totalFraudCases: 1247,
        avgRiskScore: 0.34,
        peakHour: '14:00 - 15:00',
        topMerchantCategory: 'E-commerce',
    };

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
                        value={summaryStats.totalFraudCases.toLocaleString()}
                        subtitle="Last 30 days"
                        icon={AlertTriangle}
                        variant="high"
                        trend={{ value: 5.2, label: "vs prev month", isPositive: false }}
                    />
                    <StatCard
                        title="Avg Risk Score"
                        value={(summaryStats.avgRiskScore * 100).toFixed(0) + '%'}
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
                            {geoData
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
                                ))}
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
