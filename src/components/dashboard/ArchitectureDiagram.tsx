import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Monitor, ArrowRight, ArrowDown, Shield, Radar, Globe, Workflow, BarChart3, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArchitectureDiagram() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-5 w-5 text-primary" />
          Demo Architecture
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Two-system setup: System B generates logs → System A processes &amp; responds
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          {/* System B */}
          <div className="flex-shrink-0 w-full lg:w-56">
            <div className="rounded-xl border-2 border-warning/40 bg-warning/5 p-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-warning/20">
                  <Monitor className="h-7 w-7 text-warning" />
                </div>
              </div>
              <h3 className="font-bold text-sm">System B</h3>
              <p className="text-[11px] text-muted-foreground mb-3">Monitored Host / Victim</p>
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                  Generate auth logs
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                  Simulate brute-force SSH
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                  Store logs in auth.log
                </div>
              </div>
              <div className="mt-3 p-2 rounded bg-background/80 border border-border">
                <code className="text-[9px] text-destructive font-mono leading-relaxed block text-left">
                  Failed password for root<br />
                  from 192.168.1.20 port 22 ssh2
                </code>
              </div>
            </div>
          </div>

          {/* Connection Arrow */}
          <div className="flex flex-col items-center justify-center py-2 lg:py-12 shrink-0">
            <div className="hidden lg:flex items-center gap-2">
              <div className="h-px w-10 bg-primary/50" />
              <div className="flex flex-col items-center gap-1">
                <Wifi className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[9px] text-muted-foreground font-mono">SSH / Logs</span>
                <span className="text-[9px] text-muted-foreground font-mono">Same LAN</span>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
            <div className="flex lg:hidden flex-col items-center gap-1">
              <ArrowDown className="h-5 w-5 text-primary" />
              <span className="text-[9px] text-muted-foreground font-mono">SSH / Log Forwarding</span>
            </div>
          </div>

          {/* System A */}
          <div className="flex-1 w-full">
            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">System A – SOAR Tool</h3>
                  <p className="text-[11px] text-muted-foreground">Automation &amp; Dashboard Engine</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { icon: Radar, label: 'Module 1', title: 'Threat Detection', desc: 'Parse logs, extract IPs, detect brute-force', color: 'text-destructive' },
                  { icon: Globe, label: 'Module 2', title: 'Threat Intelligence', desc: 'IP reputation via VirusTotal / AbuseIPDB', color: 'text-warning' },
                  { icon: Workflow, label: 'Module 3', title: 'Automated Response', desc: 'Block IP, log incident, alert SOC', color: 'text-success' },
                  { icon: BarChart3, label: 'Module 4', title: 'SOC Dashboard', desc: 'Alerts, charts, timeline, status', color: 'text-info' },
                ].map((mod) => (
                  <div key={mod.label} className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                    <mod.icon className={cn("h-4 w-4 mb-1.5", mod.color)} />
                    <Badge variant="outline" className="text-[8px] px-1 py-0 mb-1">{mod.label}</Badge>
                    <h4 className="text-[11px] font-semibold">{mod.title}</h4>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{mod.desc}</p>
                  </div>
                ))}
              </div>

              {/* Workflow arrow */}
              <div className="flex items-center justify-center gap-1 mt-3 text-[9px] text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">Detect</span>
                <ArrowRight className="h-3 w-3" />
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">Enrich</span>
                <ArrowRight className="h-3 w-3" />
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">Respond</span>
                <ArrowRight className="h-3 w-3" />
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">Visualize</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Stack:</span>
          {['Python', 'Flask', 'Paramiko (SSH)', 'Regex', 'HTML/CSS/JS', 'SQLite'].map((tech) => (
            <Badge key={tech} variant="outline" className="text-[9px] px-1.5 py-0 font-mono">{tech}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
