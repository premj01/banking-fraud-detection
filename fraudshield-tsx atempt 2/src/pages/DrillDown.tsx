import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { generateTransactions, generateUserProfile, generateFraudAlerts } from "@/lib/mockData";
import { Transaction, UserProfile, FraudAlert } from "@/types/fraud";
import { useSearchParams } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Smartphone, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { TransactionRow } from "@/components/dashboard/TransactionRow";
import { Sparkline } from "@/components/dashboard/Charts";

export default function DrillDown() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);

  useEffect(() => {
    const txnId = searchParams.get('txn');
    const txns = generateTransactions(25);
    setTransactions(txns);
    
    if (txnId) {
      const found = txns.find(t => t.transaction_id === txnId) || txns[0];
      setSelectedTxn(found);
      setUser(generateUserProfile(found.user_id));
      setAlerts(generateFraudAlerts(5).filter(a => a.user_id === found.user_id || Math.random() > 0.5));
    } else {
      setSelectedTxn(txns[0]);
      setUser(generateUserProfile(txns[0].user_id));
      setAlerts(generateFraudAlerts(5));
    }
  }, [searchParams]);

  if (!user || !selectedTxn) return null;

  const riskColor = user.risk_level === 'High' ? 'risk-high' : 
                   user.risk_level === 'Medium' ? 'risk-medium' : 'risk-low';

  const spendingData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10000) + 1000);

  return (
    <DashboardLayout 
      title="Transaction Drill-Down" 
      subtitle="Detailed user and transaction analysis"
    >
      <div className="space-y-6 fade-in">
        {/* User Profile Header */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* User Info */}
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold",
                `bg-${riskColor}/10 text-${riskColor}`
              )}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <Badge className={cn(
                    user.risk_level === 'High' ? 'bg-risk-high' :
                    user.risk_level === 'Medium' ? 'bg-risk-medium' :
                    'bg-risk-low',
                    'text-white'
                  )}>
                    {user.risk_level} Risk
                  </Badge>
                  <Badge variant="outline">{user.account_status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold">{user.account_age_days}</p>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold">{user.total_transactions}</p>
                <p className="text-xs text-muted-foreground">Total Txns</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-risk-medium">{user.flagged_transactions}</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold">{user.known_devices}</p>
                <p className="text-xs text-muted-foreground">Devices</p>
              </div>
            </div>
          </div>

          {/* Behavior Baseline */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="text-sm font-medium mb-4">Behavior Baseline</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Avg Transaction</p>
                <p className="font-mono font-medium">₹{user.avg_transaction_amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily Txn Count</p>
                <p className="font-mono font-medium">{user.daily_transaction_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Usual Locations</p>
                <p className="font-mono font-medium">{user.usual_locations.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="font-mono font-medium">{formatDistanceToNow(new Date(user.last_login), { addSuffix: true })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selected Transaction Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Card */}
            <div className="glass-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Selected Transaction</h3>
                <span className="font-mono text-sm text-muted-foreground">{selectedTxn.transaction_id}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Amount
                  </p>
                  <p className="text-2xl font-mono font-bold">₹{selectedTxn.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedTxn.transaction_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Risk Score
                  </p>
                  <p className={cn(
                    "text-2xl font-mono font-bold",
                    selectedTxn.risk_score > 0.7 ? "text-risk-high" :
                    selectedTxn.risk_score > 0.4 ? "text-risk-medium" :
                    "text-risk-low"
                  )}>
                    {(selectedTxn.risk_score * 100).toFixed(0)}%
                  </p>
                  <Badge className={cn(
                    "text-xs capitalize",
                    selectedTxn.status === 'approved' ? 'bg-risk-low' :
                    selectedTxn.status === 'flagged' ? 'bg-risk-medium' :
                    'bg-risk-high',
                    'text-white'
                  )}>
                    {selectedTxn.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Timestamp
                  </p>
                  <p className="font-mono font-medium">{format(new Date(selectedTxn.timestamp), 'MMM d, HH:mm:ss')}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(selectedTxn.timestamp), { addSuffix: true })}</p>
                </div>
              </div>

              {/* Location & Device */}
              <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="font-medium">{selectedTxn.location.city}, {selectedTxn.location.state}</p>
                  <p className="text-sm text-muted-foreground">{selectedTxn.location.country}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {selectedTxn.location.latitude.toFixed(4)}, {selectedTxn.location.longitude.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Smartphone className="w-3 h-3" /> Device
                  </p>
                  <p className="font-medium capitalize">{selectedTxn.device.device_type} • {selectedTxn.device.os}</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedTxn.device.ip_address}</p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {selectedTxn.device.device_id}</p>
                </div>
              </div>

              {/* Merchant */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Merchant</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedTxn.merchant_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTxn.merchant_category}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{selectedTxn.merchant_id}</span>
                </div>
              </div>

              {/* Rule Hits */}
              {selectedTxn.rule_hits && selectedTxn.rule_hits.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Rule Hits ({selectedTxn.rule_hits.length})
                  </p>
                  <div className="space-y-2">
                    {selectedTxn.rule_hits.map((rule, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-risk-medium/10 text-sm">
                        <AlertTriangle className="w-4 h-4 text-risk-medium shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Spending Pattern */}
            <div className="glass-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">30-Day Spending Pattern</h3>
              <Sparkline data={spendingData} color="primary" className="h-[100px]" />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Related Alerts */}
            <div className="glass-card rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-4">Related Alerts</h4>
              <div className="space-y-2">
                {alerts.slice(0, 4).map((alert) => (
                  <div 
                    key={alert.alert_id}
                    className={cn(
                      "p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-muted/30",
                      alert.severity === 'Critical' || alert.severity === 'High' 
                        ? 'border-l-risk-high bg-risk-high/5' 
                        : alert.severity === 'Medium' 
                          ? 'border-l-risk-medium bg-risk-medium/5'
                          : 'border-l-risk-low bg-risk-low/5'
                    )}
                  >
                    <p className="text-sm font-medium">{alert.alert_type}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-risk-low" />
                  Mark as Verified
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2 text-risk-medium" />
                  Escalate Case
                </Button>
                <Button variant="outline" className="w-full justify-start text-risk-high" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Block User
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h3 className="font-semibold">User Transaction History</h3>
            <p className="text-sm text-muted-foreground">Recent transactions from this user</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {transactions.slice(0, 10).map((txn) => (
              <div 
                key={txn.transaction_id}
                className={cn(
                  txn.transaction_id === selectedTxn.transaction_id && 'bg-primary/5'
                )}
              >
                <TransactionRow 
                  transaction={txn}
                  onClick={() => setSelectedTxn(txn)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
