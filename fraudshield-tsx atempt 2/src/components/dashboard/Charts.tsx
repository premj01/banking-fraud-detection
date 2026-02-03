import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

interface ChartProps {
  data: any[];
  className?: string;
}

const chartColors = {
  primary: 'hsl(217, 91%, 60%)',
  secondary: 'hsl(160, 84%, 39%)',
  warning: 'hsl(38, 92%, 50%)',
  danger: 'hsl(0, 72%, 51%)',
  purple: 'hsl(262, 83%, 58%)',
  muted: 'hsl(215, 20%, 65%)',
};

const customTooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 9%)',
  border: '1px solid hsl(217, 33%, 20%)',
  borderRadius: '8px',
  padding: '12px',
};

// Fraud Trend Line Chart
export function FraudTrendChart({ data, className }: ChartProps) {
  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.danger} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartColors.danger} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={customTooltipStyle}
            labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke={chartColors.primary} 
            fill="url(#totalGradient)" 
            strokeWidth={2}
            name="Total Transactions"
          />
          <Area 
            type="monotone" 
            dataKey="fraud" 
            stroke={chartColors.danger} 
            fill="url(#fraudGradient)" 
            strokeWidth={2}
            name="Flagged"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Risk Distribution Pie Chart
export function RiskDistributionChart({ data, className }: ChartProps) {
  const COLORS = [chartColors.danger, chartColors.warning, chartColors.secondary];

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={customTooltipStyle}
            labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
          />
          <Legend 
            formatter={(value) => <span style={{ color: 'hsl(215, 20%, 65%)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Transaction Volume Bar Chart
export function VolumeBarChart({ data, className }: ChartProps) {
  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={customTooltipStyle}
            labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
          />
          <Bar dataKey="value" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Model Performance Line Chart
export function ModelPerformanceChart({ data, className }: ChartProps) {
  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            domain={[80, 100]}
          />
          <Tooltip 
            contentStyle={customTooltipStyle}
            labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
          />
          <Legend 
            formatter={(value) => <span style={{ color: 'hsl(215, 20%, 65%)' }}>{value}</span>}
          />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke={chartColors.primary} 
            strokeWidth={2}
            dot={false}
            name="Accuracy"
          />
          <Line 
            type="monotone" 
            dataKey="precision" 
            stroke={chartColors.secondary} 
            strokeWidth={2}
            dot={false}
            name="Precision"
          />
          <Line 
            type="monotone" 
            dataKey="recall" 
            stroke={chartColors.warning} 
            strokeWidth={2}
            dot={false}
            name="Recall"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Risk Scatter Plot
export function RiskScatterChart({ data, className }: ChartProps) {
  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
          <XAxis 
            type="number" 
            dataKey="amount" 
            name="Amount (₹)"
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <YAxis 
            type="number" 
            dataKey="risk_score" 
            name="Risk Score"
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(217, 33%, 20%)' }}
            tickLine={false}
            domain={[0, 1]}
          />
          <ZAxis type="number" dataKey="count" range={[50, 400]} />
          <Tooltip 
            contentStyle={customTooltipStyle}
            labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
            formatter={(value: number, name: string) => {
              if (name === 'Amount (₹)') return `₹${value.toLocaleString()}`;
              if (name === 'Risk Score') return value.toFixed(2);
              return value;
            }}
          />
          <Scatter 
            name="Transactions" 
            data={data} 
            fill={chartColors.primary}
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// Simple Sparkline
export function Sparkline({ data, color = 'primary', className }: { data: number[], color?: 'primary' | 'danger' | 'success', className?: string }) {
  const chartData = data.map((value, index) => ({ index, value }));
  const colorMap = {
    primary: chartColors.primary,
    danger: chartColors.danger,
    success: chartColors.secondary,
  };

  return (
    <div className={cn("w-full h-[40px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={colorMap[color]} 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
