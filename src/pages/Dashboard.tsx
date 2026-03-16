import { defaultPlaybook } from "@/data/mockData";
import { ArchitectureDiagram } from "@/components/dashboard/ArchitectureDiagram";
import { SOCVisualization } from "@/components/dashboard/SOCVisualization";
import { ThreatDetectionPanel } from "@/components/dashboard/ThreatDetectionPanel";
import { ThreatIntelPanel } from "@/components/dashboard/ThreatIntelPanel";
import { AutomatedResponsePanel } from "@/components/dashboard/AutomatedResponsePanel";

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SOAR Tool for Automated Security Operations</h1>
          <p className="text-muted-foreground">
            Security Orchestration, Automation &amp; Response – SOC Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Live Monitoring</span>
        </div>
      </div>

      {/* Architecture Diagram */}
      <ArchitectureDiagram />

      {/* Module 4 – SOC Dashboard Summary Stats & Charts */}
      <SOCVisualization />

      {/* Module 1 – Threat Detection */}
      <ThreatDetectionPanel />

      {/* Module 2 – Threat Intelligence */}
      <ThreatIntelPanel />

      {/* Module 3 – Automated Response */}
      <AutomatedResponsePanel />
    </div>
  );
}
