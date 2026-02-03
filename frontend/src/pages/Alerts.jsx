import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { generateFraudAlerts } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        setAlerts(generateFraudAlerts(15));
    }, []);

    return (
        <DashboardLayout
            title="Alert Management"
            subtitle="Review and resolve detected fraud alerts"
        >
            <div className="space-y-6 fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter Alerts
                        </Button>
                        <Button variant="outline" size="sm">
                            Unresolved Only
                        </Button>
                    </div>
                    <Button size="sm">Mark All Read</Button>
                </div>

                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <AlertItem key={alert.alert_id} alert={alert} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
