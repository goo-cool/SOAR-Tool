import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, Play, CheckCircle2, Clock, Loader2, Terminal, 
  AlertTriangle, Globe, ShieldBan, FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseStep {
  id: string;
  name: string;
  description: string;
  command?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  icon: React.ElementType;
}

const initialSteps: ResponseStep[] = [
  {
    id: 'r1',
    name: 'Alert Detected',
    description: 'Brute-force SSH login detected from 192.168.1.20 – 47 failed attempts in 3 minutes.',
    command: 'python maindetect.py → 🚨 ALERT: 192.168.1.20 failed 47 times (Threshold = 3)',
    status: 'pending',
    icon: AlertTriangle,
  },
  {
    id: 'r2',
    name: 'Reputation Verified',
    description: 'IP reputation checked via AbuseIPDB – Classification: Malicious (Score: 92/100, 156 reports).',
    command: 'requests.get("https://api.abuseipdb.com/api/v2/check?ipAddress=192.168.1.20")',
    status: 'pending',
    icon: Globe,
  },
  {
    id: 'r3',
    name: 'Response Action Triggered',
    description: 'Firewall rule applied to block attacker IP on all interfaces.',
    command: 'iptables -A INPUT -s 192.168.1.20 -j DROP',
    status: 'pending',
    icon: ShieldBan,
  },
  {
    id: 'r4',
    name: 'Incident Logged',
    description: 'Incident record created in database. SOC team notified via dashboard and email alert.',
    command: 'INSERT INTO incidents (ip, action, severity) VALUES ("192.168.1.20", "BLOCKED", "critical")',
    status: 'pending',
    icon: FileText,
  },
];

const statusConfig = {
  pending: { color: 'border-muted bg-muted/30', text: 'text-muted-foreground', label: 'Pending' },
  running: { color: 'border-primary bg-primary/10 animate-pulse', text: 'text-primary', label: 'Running' },
  completed: { color: 'border-success bg-success/10', text: 'text-success', label: 'Done' },
  failed: { color: 'border-destructive bg-destructive/10', text: 'text-destructive', label: 'Failed' },
};

export function AutomatedResponsePanel() {
  const [steps, setSteps] = useState<ResponseStep[]>(initialSteps);
  const [isExecuting, setIsExecuting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const runPlaybook = async () => {
    setIsExecuting(true);
    setLog([]);
    setSteps(initialSteps);

    for (let i = 0; i < initialSteps.length; i++) {
      // Set running
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ▶ ${initialSteps[i].name}...`]);

      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500));

      // Complete
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✓ ${initialSteps[i].name} — ${initialSteps[i].command || 'OK'}`]);
    }

    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Playbook execution complete. All steps successful.`]);
    setIsExecuting(false);
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Module 3 – Automated Response
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Playbook execution: Detect → Validate → Block → Log
            </p>
          </div>
          <Button onClick={runPlaybook} disabled={isExecuting} size="sm">
            {isExecuting ? (
              <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Running...</>
            ) : (
              <><Play className="mr-1.5 h-3.5 w-3.5" />Run Playbook</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Steps timeline */}
          <div className="space-y-3">
            {steps.map((step, i) => {
              const config = statusConfig[step.status];
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="relative">
                  {i < steps.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-border z-0" />
                  )}
                  <div className={cn("flex items-start gap-3 p-3 rounded-lg border transition-all", config.color)}>
                    <div className={cn("mt-0.5 p-1.5 rounded-full border shrink-0 relative z-10", config.color)}>
                      {step.status === 'running' ? (
                        <Loader2 className={cn("h-4 w-4 animate-spin", config.text)} />
                      ) : step.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <StepIcon className={cn("h-4 w-4", config.text)} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{step.name}</span>
                        <Badge variant="outline" className={cn("text-[8px] px-1 py-0", config.text)}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      {step.command && step.status === 'completed' && (
                        <code className="block text-[10px] font-mono text-primary/80 bg-background/80 rounded px-2 py-1 mt-1.5 border border-border">
                          $ {step.command}
                        </code>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal Log */}
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-mono text-muted-foreground">Response Log</span>
              {completedCount > 0 && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 ml-auto">
                  {completedCount}/{steps.length}
                </Badge>
              )}
            </div>
            <div className="p-3 h-64 overflow-y-auto font-mono text-[11px] space-y-0.5">
              {log.length === 0 ? (
                <span className="text-muted-foreground">Click "Run Playbook" to simulate automated response...</span>
              ) : (
                log.map((line, i) => (
                  <div key={i} className={cn(
                    line.includes('✓') ? 'text-success' : line.includes('✅') ? 'text-success font-semibold' : 'text-muted-foreground'
                  )}>
                    {line}
                  </div>
                ))
              )}
              {isExecuting && (
                <div className="flex items-center gap-1 text-primary animate-pulse">
                  <span>█</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
