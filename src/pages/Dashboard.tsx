import { useState } from "react";
import { Alert } from "@/types/soar";
import { mockAlerts, defaultPlaybook } from "@/data/mockData";
import { AlertDetailsPanel } from "@/components/dashboard/AlertDetailsPanel";
import { ThreatDetectionPanel } from "@/components/dashboard/ThreatDetectionPanel";
import { ThreatIntelPanel } from "@/components/dashboard/ThreatIntelPanel";
import { SOCVisualization } from "@/components/dashboard/SOCVisualization";
import { PlaybookVisualization } from "@/components/playbooks/PlaybookVisualization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radar, Globe, Workflow, Shield } from "lucide-react";

export default function Dashboard() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

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

      {/* SOC Dashboard (Module 4) – always visible at top */}
      <SOCVisualization />

      {/* Tabbed modules */}
      <Tabs defaultValue="detection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detection" className="flex items-center gap-2 text-xs sm:text-sm">
            <Radar className="h-4 w-4" />
            Threat Detection
          </TabsTrigger>
          <TabsTrigger value="intel" className="flex items-center gap-2 text-xs sm:text-sm">
            <Globe className="h-4 w-4" />
            Threat Intelligence
          </TabsTrigger>
          <TabsTrigger value="response" className="flex items-center gap-2 text-xs sm:text-sm">
            <Workflow className="h-4 w-4" />
            Automated Response
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="space-y-4">
          <ThreatDetectionPanel />
        </TabsContent>

        <TabsContent value="intel" className="space-y-4">
          <ThreatIntelPanel />
        </TabsContent>

        <TabsContent value="response" className="space-y-4">
          <PlaybookVisualization playbook={defaultPlaybook} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
