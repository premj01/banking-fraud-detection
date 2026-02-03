import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ModelPerformanceChart } from "@/components/dashboard/Charts";
import { generateModelPerformance, generateRulePerformance } from "@/lib/mockData";
import { ModelPerformance, RulePerformance } from "@/types/fraud";
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
  const [modelData, setModelData] = useState<ModelPerformance[]>([]);
  const [ruleData, setRuleData] = useState<RulePerformance[]>([]);

  useEffect(() => {
    setModelData(generateModelPerformance());
    setRuleData(generateRulePerformance());
  }, []);

  const latestMetrics = modelData[modelData.length - 1] || {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1_score: 0,
    false_positive_rate: 0,
    detection_rate: 0,
  };

  const radarData = [
    { metric: 'Accuracy', value: latestMetrics.accuracy, fullMark: 100 },
    { metric: 'Precision', value: latestMetrics.precision, fullMark: 100 },
    { metric: 'Recall', value: latestMetrics.recall, fullMark: 100 },
    { metric: 'F1 Score', value: latestMetrics.f1_score, fullMark: 100 },
    { metric: 'Detection', value: latestMetrics.detection_rate, fullMark: 100 },
  ];

  const customTooltipStyle = {
    backgroundColor: 'hsl(222, 47%, 9%)',
    border: '1px solid hsl(217, 33%, 20%)',
    borderRadius: '8px',
    padding: '12px',
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
                  <PolarGrid stroke="hsl(217, 33%, 20%)" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }}
                  />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="hsl(217, 91%, 60%)"
                    fill="hsl(217, 91%, 60%)"
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
              latestMetrics.false_positive_rate < 3 ? 'bg-risk-low' :
              latestMetrics.false_positive_rate < 5 ? 'bg-risk-medium' :
              'bg-risk-high',
              'text-white'
            )}>
              Current: {latestMetrics.false_positive_rate.toFixed(1)}%
            </Badge>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fpTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
                  tickLine={false}
                  domain={[0, 10]}
                />
                <Tooltip contentStyle={customTooltipStyle} />
                {/* Target line at 3% */}
                <Line 
                  type="monotone" 
                  dataKey={() => 3} 
                  stroke="hsl(160, 84%, 39%)"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="hsl(38, 92%, 50%)"
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
                        rule.effectiveness > 75 ? "text-risk-low" :
                        rule.effectiveness > 50 ? "text-risk-medium" :
                        "text-risk-high"
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
              <div className="p-4 rounded-lg bg-risk-medium/10 border border-risk-medium/20">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-risk-medium" />
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

              {/* Recommendation */}
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Recommendation:</span> The ML model shows 
                  {latestMetrics.detection_rate > 90 ? ' excellent' : ' good'} detection rates with 
                  {latestMetrics.false_positive_rate < 4 ? ' low' : ' moderate'} false positives. 
                  Consider combining high-performing rules with ML for optimal coverage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Explainability Section */}
        <div className="glass-card rounded-lg p-5">
          <h3 className="font-semibold mb-4">Model Explainability</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Top contributing features for fraud detection decisions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { feature: 'Transaction Amount', importance: 0.28, direction: 'High amounts increase risk' },
              { feature: 'Device Fingerprint', importance: 0.22, direction: 'New devices flag alerts' },
              { feature: 'Geographic Location', importance: 0.18, direction: 'Unusual locations trigger rules' },
              { feature: 'Transaction Velocity', importance: 0.15, direction: 'Rapid transactions increase score' },
            ].map((item) => (
              <div key={item.feature} className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.feature}</span>
                  <span className="font-mono text-xs text-primary">{(item.importance * 100).toFixed(0)}%</span>
                </div>
                <Progress value={item.importance * 100} className="h-1.5 mb-2" />
                <p className="text-[10px] text-muted-foreground">{item.direction}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
