import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ModelPerformanceChart } from "@/components/dashboard/Charts";
import { generateModelPerformance, generateRulePerformance } from "@/lib/mockData";
import { Brain, Target, AlertCircle, TrendingUp, Zap, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";

export default function Model() {
    const [modelData, setModelData] = useState([]);
    const [ruleData, setRuleData] = useState([]);

    useEffect(() => {
        setModelData(generateModelPerformance());
        setRuleData(generateRulePerformance());
    }, []);

    // Hardcoded metrics from actual model performance
    const latestMetrics = {
        accuracy: 93.88,
        precision: 71.00,
        recall: 83.33,
        f1_score: 76.53,
        false_positive_rate: 2.8,
        detection_rate: 83.33,
    };

    const radarData = [
        { metric: 'Accuracy', value: latestMetrics.accuracy, fullMark: 100 },
        { metric: 'Precision', value: latestMetrics.precision, fullMark: 100 },
        { metric: 'Recall', value: latestMetrics.recall, fullMark: 100 },
        { metric: 'F1 Score', value: latestMetrics.f1_score, fullMark: 100 },
        { metric: 'Detection', value: latestMetrics.detection_rate, fullMark: 100 },
    ];

    const customTooltipStyle = {
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '12px',
        color: 'hsl(var(--foreground))',
    };

    const fpTrendData = modelData.map(d => ({
        date: d.date.slice(5),
        rate: d.false_positive_rate,
    }));

    return (
        <DashboardLayout
            title="Model Performance"
            subtitle="ML model metrics and rule effectiveness analysis"
        >
            <div className="space-y-6 fade-in">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard
                        title="Accuracy"
                        value={`${latestMetrics.accuracy.toFixed(1)}%`}
                        icon={Target}
                        variant="low"
                    />
                    <StatCard
                        title="Precision"
                        value={`${latestMetrics.precision.toFixed(1)}%`}
                        icon={Zap}
                        variant="info"
                    />
                    <StatCard
                        title="Recall"
                        value={`${latestMetrics.recall.toFixed(1)}%`}
                        icon={Brain}
                        variant="info"
                    />
                    <StatCard
                        title="F1 Score"
                        value={`${latestMetrics.f1_score.toFixed(1)}%`}
                        icon={TrendingUp}
                        variant="low"
                    />
                    <StatCard
                        title="Detection Rate"
                        value={`${latestMetrics.detection_rate.toFixed(1)}%`}
                        icon={CheckCircle}
                        variant="low"
                    />
                    <StatCard
                        title="False Positive"
                        value={`${latestMetrics.false_positive_rate.toFixed(1)}%`}
                        icon={AlertCircle}
                        variant="medium"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Over Time */}
                    <div className="lg:col-span-2 glass-card rounded-lg p-5">
                        <h3 className="font-semibold mb-4">Model Performance Over Time</h3>
                        <ModelPerformanceChart data={modelData} />
                    </div>

                    {/* Radar Chart */}
                    <div className="glass-card rounded-lg p-5">
                        <h3 className="font-semibold mb-4">Current Metrics</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="hsl(var(--border))" />
                                    <PolarAngleAxis
                                        dataKey="metric"
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                    />
                                    <PolarRadiusAxis
                                        angle={30}
                                        domain={[0, 100]}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                    />
                                    <Radar
                                        name="Performance"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                    />
                                    <Tooltip contentStyle={customTooltipStyle} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* False Positive Trend */}
                <div className="glass-card rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold">False Positive Rate Trend</h3>
                            <p className="text-sm text-muted-foreground">Lower is better - target: &lt;3%</p>
                        </div>
                        <Badge className={cn(
                            latestMetrics.false_positive_rate < 3 ? 'bg-emerald-500' :
                                latestMetrics.false_positive_rate < 5 ? 'bg-amber-500' :
                                    'bg-red-500',
                            'text-white'
                        )}>
                            Current: {latestMetrics.false_positive_rate.toFixed(1)}%
                        </Badge>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={fpTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                    axisLine={{ stroke: 'hsl(var(--border))' }}
                                    tickLine={false}
                                    domain={[0, 10]}
                                />
                                <Tooltip contentStyle={customTooltipStyle} />
                                {/* Target line at 3% */}
                                <Line
                                    type="monotone"
                                    dataKey={() => 3}
                                    stroke="#10b981"
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="Target"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={false}
                                    name="FP Rate"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rule vs ML Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rule Performance */}
                    <div className="glass-card rounded-lg p-5">
                        <h3 className="font-semibold mb-4">Rule-Based Detection Performance</h3>
                        <div className="space-y-4">
                            {ruleData.map((rule) => (
                                <div key={rule.rule_name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{rule.rule_name}</span>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-muted-foreground">{rule.triggers} triggers</span>
                                            <span className={cn(
                                                "font-mono",
                                                rule.effectiveness > 75 ? "text-emerald-500" :
                                                    rule.effectiveness > 50 ? "text-amber-500" :
                                                        "text-red-500"
                                            )}>
                                                {rule.effectiveness.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                    <Progress value={rule.effectiveness} className="h-2" />
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>True Positives: {rule.true_positives}</span>
                                        <span>False Positives: {rule.false_positives}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ML vs Rules Comparison */}
                    <div className="glass-card rounded-lg p-5">
                        <h3 className="font-semibold mb-4">ML vs Rules: Detection Comparison</h3>
                        <div className="space-y-6">
                            {/* ML Stats */}
                            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain className="w-5 h-5 text-primary" />
                                    <span className="font-medium">Machine Learning Model</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Detection</p>
                                        <p className="font-mono font-bold text-lg">{latestMetrics.detection_rate.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Precision</p>
                                        <p className="font-mono font-bold text-lg">{latestMetrics.precision.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">FP Rate</p>
                                        <p className="font-mono font-bold text-lg">{latestMetrics.false_positive_rate.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rule Stats */}
                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <span className="font-medium">Rule-Based System</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Avg Effectiveness</p>
                                        <p className="font-mono font-bold text-lg">
                                            {(ruleData.reduce((sum, r) => sum + r.effectiveness, 0) / ruleData.length).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total Triggers</p>
                                        <p className="font-mono font-bold text-lg">
                                            {ruleData.reduce((sum, r) => sum + r.triggers, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">True Positives</p>
                                        <p className="font-mono font-bold text-lg">
                                            {ruleData.reduce((sum, r) => sum + r.true_positives, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
