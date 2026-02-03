import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
    const { user } = useAuth();

    return (
        <DashboardLayout
            title="Settings"
            subtitle="Manage account and application preferences"
        >
            <div className="max-w-2xl space-y-8 fade-in">
                {/* Profile Settings */}
                <div className="glass-card rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user?.email || ''} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" value="Fraud Analyst" disabled />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="glass-card rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>High Priority Alerts</Label>
                                <p className="text-sm text-muted-foreground">Receive emails for critical fraud detections</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Daily Digest</Label>
                                <p className="text-sm text-muted-foreground">Summary of daily fraud statistics</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>

                {/* System preferences */}
                <div className="glass-card rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">System Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">Force dark mode theme</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button variant="outline" className="text-red-500 hover:text-red-600">
                            Reset All Settings
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
