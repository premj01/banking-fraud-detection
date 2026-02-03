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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";

const chartColors = {
    primary: '#3b82f6', // blue-500
    secondary: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    purple: '#8b5cf6', // violet-500
    muted: '#64748b', // slate-500
};

const customTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    padding: '12px',
    color: 'hsl(var(--foreground))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

// Fraud Trend Line Chart
export function FraudTrendChart({ data, className }) {
    return (
        <div className={cn("w-full h-[300px]", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.danger} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartColors.danger} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={customTooltipStyle}
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
export function RiskDistributionChart({ data, className }) {
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
                    />
                    <Legend
                        formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// Transaction Volume Bar Chart
export function VolumeBarChart({ data, className }) {
    return (
        <div className={cn("w-full h-[300px]", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                    />
                    <Bar dataKey="value" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Model Performance Line Chart
export function ModelPerformanceChart({ data, className }) {
    return (
        <div className={cn("w-full h-[300px]", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        domain={[80, 100]}
                    />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                    />
                    <Legend
                        formatter={(value) => <span className="text-muted-foreground">{value}</span>}
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
export function RiskScatterChart({ data, className }) {
    return (
        <div className={cn("w-full h-[300px]", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        type="number"
                        dataKey="amount"
                        name="Amount (₹)"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                        type="number"
                        dataKey="risk_score"
                        name="Risk Score"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                        domain={[0, 1]}
                    />
                    <ZAxis type="number" dataKey="count" range={[50, 400]} />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                                        <p className="text-sm font-semibold mb-1">Transaction Details</p>
                                        <p className="text-xs text-muted-foreground">Amount: <span className="text-foreground font-mono font-medium">₹{data.amount.toLocaleString()}</span></p>
                                        <p className="text-xs text-muted-foreground">Risk Score: <span className="text-foreground font-mono font-medium">{data.risk_score.toFixed(2)}</span></p>
                                        <p className="text-xs text-muted-foreground">Count: <span className="text-foreground font-mono font-medium">{data.count}</span></p>
                                    </div>
                                );
                            }
                            return null;
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
export function Sparkline({ data, color = 'primary', className }) {
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
