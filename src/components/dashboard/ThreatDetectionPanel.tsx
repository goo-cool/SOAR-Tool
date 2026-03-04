import { authLogEntries, AuthLogEntry } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Radar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const severityColors: Record<string, string> = {
  critical: 'bg-severity-critical text-white',
  high: 'bg-severity-high text-white',
  medium: 'bg-severity-medium text-white',
  low: 'bg-severity-low text-white',
  info: 'bg-severity-info text-white',
};

const statusColors: Record<string, string> = {
  failed: 'text-destructive',
  success: 'text-success',
  blocked: 'text-warning',
};

const suspiciousIPs = ['192.168.1.100', '45.33.32.156', '203.45.67.89'];

export function ThreatDetectionPanel() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radar className="h-5 w-5 text-primary" />
          Module 1 – Threat Detection
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Authentication log analysis – Brute force login detection
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold">Source IP</TableHead>
                <TableHead className="text-xs font-semibold">Event Type</TableHead>
                <TableHead className="text-xs font-semibold">Severity</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authLogEntries.map((entry) => (
                <TableRow key={entry.id} className="border-border hover:bg-muted/30 text-sm">
                  <TableCell className="font-mono text-xs text-muted-foreground">{entry.timestamp}</TableCell>
                  <TableCell className={cn(
                    "font-mono text-xs",
                    suspiciousIPs.includes(entry.sourceIP) && "text-destructive font-bold"
                  )}>
                    {entry.sourceIP}
                    {suspiciousIPs.includes(entry.sourceIP) && (
                      <AlertTriangle className="inline ml-1 h-3 w-3" />
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{entry.eventType}</TableCell>
                  <TableCell>
                    <Badge className={cn(severityColors[entry.severity], "text-[10px] px-1.5 py-0")}>
                      {entry.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-medium uppercase", statusColors[entry.status])}>
                      {entry.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
