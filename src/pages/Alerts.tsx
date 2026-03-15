import { useState } from "react";
import { Alert } from "@/types/soar";
import { mockAlerts } from "@/data/mockData";
import { AlertsTable } from "@/components/dashboard/AlertsTable";
import { AlertDetailsPanel } from "@/components/dashboard/AlertDetailsPanel";
import { AlertTriangle } from "lucide-react";

export default function Alerts() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-primary" />
          Security Alerts
        </h1>
        <p className="text-muted-foreground mt-1">
          Click on any alert to view full details including description, what happened, and next steps
        </p>
      </div>

      {/* Split layout: table + detail panel */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <AlertsTable
            alerts={mockAlerts}
            onAlertSelect={setSelectedAlert}
            selectedAlertId={selectedAlert?.id}
          />
        </div>
        <div className="lg:col-span-2">
          <AlertDetailsPanel alert={selectedAlert} />
        </div>
      </div>
    </div>
  );
}
