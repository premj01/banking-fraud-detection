import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { generateInvestigators } from "@/lib/mockData";
import { Users, Clock, CheckCircle, AlertTriangle, X, ChevronRight, Briefcase, Award, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";

import { useAuth } from "@/context/AuthContext";

export default function Investigators() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [investigators, setInvestigators] = useState([]);
    const [selectedInvestigator, setSelectedInvestigator] = useState(null);

    useEffect(() => {
        const mocks = generateInvestigators(12);
        let allInvestigators = mocks;

        if (user) {
            // Create a mock profile for the current logged-in user
            const currentUserProfile = {
                id: user.id || 'current-user',
                name: user.name || 'You',
                email: user.email || 'you@example.com',
                role: 'Senior Investigator', // Fallback or mock role
                open_cases: 8,
                closed_cases: 342,
                avg_resolution_time: 2.4,
                workload: 'Low',
                isCurrentUser: true
            };
            allInvestigators = [currentUserProfile, ...mocks];
        }

        setInvestigators(allInvestigators);

        // Deep linking: Select investigator if query param exists
        const linkedId = searchParams.get('id');
        if (linkedId) {
            // Find by exact ID or simple match
            const found = allInvestigators.find(inv => inv.id === linkedId || inv.name.toLowerCase().includes(linkedId.toLowerCase()));
            if (found) {
                setSelectedInvestigator(found);
            }
        }
    }, [user, searchParams]);

    const totalOpen = investigators.reduce((sum, inv) => sum + inv.open_cases, 0);
    const totalClosed = investigators.reduce((sum, inv) => sum + inv.closed_cases, 0);
    const avgResTime = investigators.reduce((sum, inv) => sum + inv.avg_resolution_time, 0) / investigators.length || 0;

    const workloadColors = {
        'Low': 'bg-emerald-500 text-white',
        'Medium': 'bg-amber-500 text-black',
        'High': 'bg-red-500 text-white',
        'Critical': 'bg-purple-500 text-white',
    };

    return (
        <DashboardLayout
            title="Investigator Network"
            subtitle="Manage fraud analyst team and workload"
        >
            <div className="flex h-[calc(100vh-140px)] gap-6 fade-in relative overflow-hidden">
                {/* Main Content Area */}
                <div className={cn(
                    "flex-1 flex flex-col gap-6 transition-all duration-300",
                    selectedInvestigator ? "w-2/3 pr-2" : "w-full"
                )}>
                    {/* Top Stats Bar - Compact */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                        <div className="glass-card p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Active Analysts</p>
                                <p className="text-2xl font-bold">{investigators.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-primary/20" />
                        </div>
                        <div className="glass-card p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Open Cases</p>
                                <p className="text-2xl font-bold text-amber-500">{totalOpen}</p>
                            </div>
                            <Briefcase className="w-8 h-8 text-amber-500/20" />
                        </div>
                        <div className="glass-card p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Cases Closed</p>
                                <p className="text-2xl font-bold text-emerald-500">{totalClosed}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-emerald-500/20" />
                        </div>
                        <div className="glass-card p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Avg Resolution</p>
                                <p className="text-2xl font-bold">{avgResTime.toFixed(1)}h</p>
                            </div>
                            <Clock className="w-8 h-8 text-primary/20" />
                        </div>
                    </div>

                    {/* Roster List */}
                    <div className="glass-card rounded-lg flex-1 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                            <div>
                                <h3 className="font-semibold">Team Roster</h3>
                                <p className="text-xs text-muted-foreground">Select an investigator to view detailed metrics</p>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-2 scrollbar-thin">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {investigators.map((inv) => (
                                    <div
                                        key={inv.id}
                                        onClick={() => setSelectedInvestigator(inv)}
                                        className={cn(
                                            "cursor-pointer group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                                            selectedInvestigator?.id === inv.id
                                                ? "border-primary bg-primary/5 shadow-md"
                                                : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                                                selectedInvestigator?.id === inv.id ? "bg-primary text-primary-foreground" : "bg-muted"
                                            )}>
                                                {inv.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium truncate">{inv.name}</p>
                                                    {inv.isCurrentUser && (
                                                        <Badge variant="secondary" className="text-[10px] h-4 px-1">You</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{inv.role}</p>
                                            </div>
                                            <ChevronRight className={cn(
                                                "w-4 h-4 text-muted-foreground transition-transform",
                                                selectedInvestigator?.id === inv.id ? "translate-x-1 text-primary" : "opacity-0 group-hover:opacity-100"
                                            )} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Workload</span>
                                                <Badge className={cn("h-5 px-1.5 text-[10px]", workloadColors[inv.workload])}>
                                                    {inv.workload}
                                                </Badge>
                                            </div>
                                            <Progress value={(inv.open_cases / 30) * 100} className="h-1" />
                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                <span>{inv.open_cases} Active</span>
                                                <span>{inv.closed_cases} Closed</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Panel */}
                {selectedInvestigator && (
                    <div className="w-[400px] shrink-0 glass-card border-none rounded-l-xl shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 absolute right-0 top-0 bottom-0 z-20 md:relative md:rounded-lg">

                        {/* Panel Header */}
                        <div className="p-6 border-b border-border/50 flex items-start justify-between bg-muted/10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl font-bold text-primary border border-primary/10">
                                    {selectedInvestigator.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold">{selectedInvestigator.name}</h2>
                                        {selectedInvestigator.isCurrentUser && (
                                            <Badge variant="secondary" className="text-xs">You</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{selectedInvestigator.role}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs font-normal">
                                            ID: {selectedInvestigator.id.substring(0, 6)}
                                        </Badge>
                                        <Badge className={cn("text-xs", workloadColors[selectedInvestigator.workload])}>
                                            {selectedInvestigator.workload} Load
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedInvestigator(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">

                            {/* Performance Radar */}
                            <div>
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-primary" /> Performance Metrics
                                </h4>
                                <div className="h-[200px] border border-border/50 rounded-lg bg-card/50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                            { subject: 'Speed', A: 100 - selectedInvestigator.avg_resolution_time },
                                            { subject: 'Accuracy', A: 90 + Math.random() * 10 },
                                            { subject: 'Volume', A: selectedInvestigator.closed_cases / 2 },
                                            { subject: 'Complex', A: 70 + Math.random() * 30 },
                                            { subject: 'Collab', A: 85 },
                                        ]}>
                                            <PolarGrid stroke="hsl(var(--border))" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name="Investigator"
                                                dataKey="A"
                                                stroke="hsl(var(--primary))"
                                                fill="hsl(var(--primary))"
                                                fillOpacity={0.3}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <p className="text-xs text-muted-foreground mb-1">Cases Closed</p>
                                    <p className="text-xl font-bold">{selectedInvestigator.closed_cases}</p>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <p className="text-xs text-muted-foreground mb-1">Avg Time</p>
                                    <p className="text-xl font-bold">{selectedInvestigator.avg_resolution_time.toFixed(1)}h</p>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                                    <p className="text-xl font-bold text-emerald-500">98.2%</p>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <p className="text-xs text-muted-foreground mb-1">Active Now</p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-sm font-medium">Online</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" /> Current Assignments
                                </h4>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="text-[10px]">CASE-{1000 + i}</Badge>
                                                <Badge className="text-[10px] bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none border-0">High Priority</Badge>
                                            </div>
                                            <p className="text-sm font-medium mb-1">Suspicious Wire Transfer</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Updated 2h ago
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <Button className="w-full">
                                    View Full Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
