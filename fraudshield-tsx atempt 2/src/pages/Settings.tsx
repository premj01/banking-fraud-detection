import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Palette, 
  Download, 
  Upload,
  Globe,
  Clock,
  Mail,
  Smartphone,
} from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout 
      title="Settings" 
      subtitle="Configure your dashboard preferences"
    >
      <div className="max-w-4xl space-y-6 fade-in">
        {/* Profile Section */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Profile Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Sarah Admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="sarah.admin@fraudops.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue="Fraud Analyst" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Asia/Kolkata (IST)" />
            </div>
          </div>
          <Button className="mt-6">Save Changes</Button>
        </div>

        {/* Notifications */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notification Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email Alerts</span>
                </div>
                <p className="text-sm text-muted-foreground">Receive critical alerts via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Push Notifications</span>
                </div>
                <p className="text-sm text-muted-foreground">Browser push for high-severity alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Daily Digest</span>
                </div>
                <p className="text-sm text-muted-foreground">Summary of daily fraud activity</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Alert Thresholds</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>High Risk Score Threshold</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="0.7" step="0.1" min="0" max="1" />
                <span className="text-sm text-muted-foreground">0-1</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Transaction Amount Alert (₹)</Label>
              <Input type="number" defaultValue="100000" />
            </div>
            <div className="space-y-2">
              <Label>Velocity Limit (txns/hour)</Label>
              <Input type="number" defaultValue="10" />
            </div>
            <div className="space-y-2">
              <Label>Geographic Anomaly Distance (km)</Label>
              <Input type="number" defaultValue="500" />
            </div>
          </div>
          <Button className="mt-6">Update Thresholds</Button>
        </div>

        {/* Security */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-medium">Two-Factor Authentication</span>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-risk-low text-white">Enabled</Badge>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-medium">Session Timeout</span>
                <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="30" className="w-20" />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-medium">API Key Management</span>
                <p className="text-sm text-muted-foreground">Manage integration API keys</p>
              </div>
              <Button variant="outline" size="sm">Manage Keys</Button>
            </div>
          </div>
        </div>

        {/* Data Export */}
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Data Export</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Transaction Report</p>
                <p className="text-sm text-muted-foreground">Export all transactions with risk scores</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Alert History</p>
                <p className="text-sm text-muted-foreground">Complete alert and case history</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Audit Logs</p>
                <p className="text-sm text-muted-foreground">System activity and user actions</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
