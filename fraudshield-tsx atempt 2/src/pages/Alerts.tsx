import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { generateFraudAlerts } from "@/lib/mockData";
import { FraudAlert } from "@/types/fraud";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'Open' | 'Under Review' | 'Escalated' | 'Closed'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'Critical' | 'High' | 'Medium' | 'Low'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setAlerts(generateFraudAlerts(50));
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.status !== filter) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (searchQuery && !alert.alert_type.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alert.transaction_id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    all: alerts.length,
    Open: alerts.filter(a => a.status === 'Open').length,
    'Under Review': alerts.filter(a => a.status === 'Under Review').length,
    Escalated: alerts.filter(a => a.status === 'Escalated').length,
    Closed: alerts.filter(a => a.status === 'Closed').length,
  };

  const severityCounts = {
    Critical: alerts.filter(a => a.severity === 'Critical').length,
    High: alerts.filter(a => a.severity === 'High').length,
    Medium: alerts.filter(a => a.severity === 'Medium').length,
    Low: alerts.filter(a => a.severity === 'Low').length,
  };

  return (
    <DashboardLayout 
      title="Alert Management" 
      subtitle="Review and manage fraud alerts"
    >
      <div className="space-y-6 fade-in">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-mono font-bold">{statusCounts.all}</p>
            <p className="text-xs text-muted-foreground">Total Alerts</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center border-l-4 border-l-risk-high">
            <p className="text-2xl font-mono font-bold text-risk-high">{statusCounts.Open}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center border-l-4 border-l-risk-medium">
            <p className="text-2xl font-mono font-bold text-risk-medium">{statusCounts['Under Review']}</p>
            <p className="text-xs text-muted-foreground">Under Review</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center border-l-4 border-l-chart-5">
            <p className="text-2xl font-mono font-bold text-chart-5">{statusCounts.Escalated}</p>
            <p className="text-xs text-muted-foreground">Escalated</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center border-l-4 border-l-risk-low">
            <p className="text-2xl font-mono font-bold text-risk-low">{statusCounts.Closed}</p>
            <p className="text-xs text-muted-foreground">Closed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by alert type or transaction ID..." 
                className="pl-9 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-muted/50 rounded-lg p-1">
              {(['all', 'Open', 'Under Review', 'Escalated', 'Closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    filter === status 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex gap-1">
              {(['Critical', 'High', 'Medium', 'Low'] as const).map((severity) => (
                <button
                  key={severity}
                  onClick={() => setSeverityFilter(severityFilter === severity ? 'all' : severity)}
                  className={cn(
                    "px-2 py-1.5 text-xs font-medium rounded-md transition-colors border",
                    severityFilter === severity
                      ? severity === 'Critical' || severity === 'High' 
                        ? 'bg-risk-high text-white border-risk-high'
                        : severity === 'Medium'
                          ? 'bg-risk-medium text-black border-risk-medium'
                          : 'bg-risk-low text-white border-risk-low'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {severity} ({severityCounts[severity]})
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </p>
          </div>
          <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div key={alert.alert_id} className="p-4 hover:bg-muted/30 transition-colors">
                <AlertItem 
                  alert={alert}
                  onClick={() => navigate(`/drilldown?alert=${alert.alert_id}`)}
                />
              </div>
            ))}
            {filteredAlerts.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No alerts match your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
