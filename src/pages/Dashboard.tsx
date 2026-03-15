import { useState } from "react";
import { Alert } from "@/types/soar";
import { mockAlerts, defaultPlaybook } from "@/data/mockData";
import { ThreatDetectionPanel } from "@/components/dashboard/ThreatDetectionPanel";
import { ThreatIntelPanel } from "@/components/dashboard/ThreatIntelPanel";
import { SOCVisualization } from "@/components/dashboard/SOCVisualization";
import { PlaybookVisualization } from "@/components/playbooks/PlaybookVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, Globe, Workflow, Shield, AlertTriangle, Activity } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SOAR Dashboard</h1>
          <p className="text-muted-foreground">
            Security Orchestration, Automation & Response
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Live Monitoring</span>
        </div>
      </div>

      {/* SOC Dashboard – Summary Stats & Charts */}
      <SOCVisualization />

      {/* Security Alerts Table */}
      <ThreatDetectionPanel />

      {/* Threat Intelligence Panel */}
      <ThreatIntelPanel />

      {/* Automated Response Playbook */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            Automated Security Response
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Automated incident response workflow – Click "Run Playbook" to simulate execution
          </p>
        </CardHeader>
        <CardContent>
          <PlaybookVisualization playbook={defaultPlaybook} />
        </CardContent>
      </Card>
    </div>
  );
}
