import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { generateInvestigators } from "@/lib/mockData";
import { Investigator } from "@/types/fraud";
import { Users, Clock, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Investigators() {
  const [investigators, setInvestigators] = useState<Investigator[]>([]);

  useEffect(() => {
    setInvestigators(generateInvestigators(8));
  }, []);

  const totalOpen = investigators.reduce((sum, inv) => sum + inv.open_cases, 0);
  const totalClosed = investigators.reduce((sum, inv) => sum + inv.closed_cases, 0);
  const avgResTime = investigators.reduce((sum, inv) => sum + inv.avg_resolution_time, 0) / investigators.length;
  const criticalLoad = investigators.filter(inv => inv.workload === 'Critical').length;

  const workloadData = [
    { name: 'Low', value: investigators.filter(i => i.workload === 'Low').length },
    { name: 'Medium', value: investigators.filter(i => i.workload === 'Medium').length },
    { name: 'High', value: investigators.filter(i => i.workload === 'High').length },
    { name: 'Critical', value: investigators.filter(i => i.workload === 'Critical').length },
  ];

  const caseData = investigators.map(inv => ({
    name: inv.name.split(' ')[0],
    open: inv.open_cases,
    closed: inv.closed_cases,
  }));

  const COLORS = ['hsl(160, 84%, 39%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(0, 84%, 40%)'];

  const customTooltipStyle = {
    backgroundColor: 'hsl(222, 47%, 9%)',
    border: '1px solid hsl(217, 33%, 20%)',
    borderRadius: '8px',
    padding: '12px',
  };

  const workloadColors = {
    'Low': 'bg-risk-low text-white',
    'Medium': 'bg-risk-medium text-black',
    'High': 'bg-risk-high text-white',
    'Critical': 'bg-chart-5 text-white',
  };

  const workloadBgColors = {
    'Low': 'bg-risk-low/10',
    'Medium': 'bg-risk-medium/10',
    'High': 'bg-risk-high/10',
    'Critical': 'bg-chart-5/10',
  };

  return (
    <DashboardLayout 
      title="Investigator Workload" 
      subtitle="Team performance and case distribution"
    >
      <div className="space-y-6 fade-in">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Open Cases"
            value={totalOpen}
            icon={AlertTriangle}
            variant="medium"
          />
          <StatCard
            title="Cases Closed (MTD)"
            value={totalClosed}
            icon={CheckCircle}
            variant="low"
          />
          <StatCard
            title="Avg Resolution Time"
            value={`${avgResTime.toFixed(1)}h`}
            icon={Clock}
            variant="info"
          />
          <StatCard
            title="Critical Workload"
            value={`${criticalLoad} analysts`}
            subtitle="Need rebalancing"
            icon={Users}
            variant="high"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case Distribution */}
          <div className="lg:col-span-2 glass-card rounded-lg p-5">
            <h3 className="font-semibold mb-4">Case Distribution by Analyst</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="open" fill="hsl(38, 92%, 50%)" name="Open Cases" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="closed" fill="hsl(160, 84%, 39%)" name="Closed Cases" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workload Distribution */}
          <div className="glass-card rounded-lg p-5">
            <h3 className="font-semibold mb-4">Workload Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workloadData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {workloadData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {workloadData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Investigator Cards */}
        <div className="glass-card rounded-lg p-5">
          <h3 className="font-semibold mb-4">Team Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {investigators.map((inv) => (
              <div 
                key={inv.id}
                className={cn(
                  "p-4 rounded-lg border border-border/50 transition-all hover:border-primary/30",
                  workloadBgColors[inv.workload]
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {inv.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{inv.name}</p>
                      <p className="text-xs text-muted-foreground">{inv.role}</p>
                    </div>
                  </div>
                  <Badge className={cn("text-[10px]", workloadColors[inv.workload])}>
                    {inv.workload}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Open Cases</span>
                    <span className="font-mono font-medium">{inv.open_cases}</span>
                  </div>
                  <Progress value={(inv.open_cases / 30) * 100} className="h-1.5" />
                </div>

                <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Closed</p>
                    <p className="font-mono font-medium">{inv.closed_cases}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Time</p>
                    <p className="font-mono font-medium">{inv.avg_resolution_time.toFixed(1)}h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Burnout Indicators */}
        <div className="glass-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Burnout Risk Indicators</h3>
              <p className="text-sm text-muted-foreground">Analysts requiring attention</p>
            </div>
          </div>
          <div className="space-y-3">
            {investigators
              .filter(inv => inv.workload === 'Critical' || inv.workload === 'High')
              .map((inv) => (
                <div 
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-risk-high/5 border border-risk-high/20"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-risk-high" />
                    <div>
                      <p className="font-medium">{inv.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {inv.open_cases} open cases • {inv.avg_resolution_time.toFixed(1)}h avg time
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(workloadColors[inv.workload])}>
                    {inv.workload} Load
                  </Badge>
                </div>
              ))}
            {investigators.filter(inv => inv.workload === 'Critical' || inv.workload === 'High').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-risk-low" />
                <p>No burnout risks detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
