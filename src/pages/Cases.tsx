import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const cases = [
  { id: 'CASE-001', title: 'Brute Force Attack – 192.168.1.100', status: 'open', severity: 'critical', assignee: 'Analyst 1', created: '2024-09-01 10:35', alerts: 3 },
  { id: 'CASE-002', title: 'Malware C2 – WS-001 Compromised', status: 'investigating', severity: 'critical', assignee: 'Analyst 2', created: '2024-09-01 09:30', alerts: 2 },
  { id: 'CASE-003', title: 'Data Exfiltration – External Transfer', status: 'open', severity: 'high', assignee: 'Analyst 1', created: '2024-09-01 11:50', alerts: 1 },
  { id: 'CASE-004', title: 'Internal Port Scan Activity', status: 'resolved', severity: 'medium', assignee: 'Analyst 3', created: '2024-09-01 08:45', alerts: 1 },
  { id: 'CASE-005', title: 'Phishing Campaign – Finance Dept', status: 'closed', severity: 'low', assignee: 'Analyst 2', created: '2024-09-01 07:35', alerts: 1 },
];

const statusColors: Record<string, string> = {
  open: 'bg-warning text-warning-foreground',
  investigating: 'bg-info text-info-foreground',
  resolved: 'bg-success text-success-foreground',
  closed: 'bg-muted text-muted-foreground',
};

const severityColors: Record<string, string> = {
  critical: 'bg-severity-critical text-white',
  high: 'bg-severity-high text-white',
  medium: 'bg-severity-medium text-white',
  low: 'bg-severity-low text-white',
};

export default function Cases() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Cases
        </h1>
        <p className="text-muted-foreground mt-1">Incident cases created from correlated security alerts</p>
      </div>

      <div className="grid gap-4">
        {cases.map((c) => (
          <Card key={c.id} className="border-border hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="font-mono text-sm text-muted-foreground w-24">{c.id}</div>
                <div>
                  <h3 className="font-medium">{c.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.created}</span>
                    <span>Assigned: {c.assignee}</span>
                    <span>{c.alerts} alert(s)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn(severityColors[c.severity], "text-[10px]")}>{c.severity}</Badge>
                <Badge className={cn(statusColors[c.status], "text-[10px]")}>{c.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
