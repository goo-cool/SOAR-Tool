import { defaultPlaybook } from "@/data/mockData";
import { ThreatDetectionPanel } from "@/components/dashboard/ThreatDetectionPanel";
import { ThreatIntelPanel } from "@/components/dashboard/ThreatIntelPanel";
import { SOCVisualization } from "@/components/dashboard/SOCVisualization";
import { PlaybookVisualization } from "@/components/playbooks/PlaybookVisualization";

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
      <PlaybookVisualization playbook={defaultPlaybook} />
    </div>
  );
}
