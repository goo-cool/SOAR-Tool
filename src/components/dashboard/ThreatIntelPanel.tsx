import { threatIntelData, ThreatIntelEntry } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const classificationConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  malicious: { color: 'bg-destructive text-destructive-foreground', icon: ShieldAlert, label: 'Malicious' },
  suspicious: { color: 'bg-warning text-warning-foreground', icon: ShieldQuestion, label: 'Suspicious' },
  clean: { color: 'bg-success text-success-foreground', icon: ShieldCheck, label: 'Clean' },
  unknown: { color: 'bg-muted text-muted-foreground', icon: ShieldQuestion, label: 'Unknown' },
};

export function ThreatIntelPanel() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Module 2 – Threat Intelligence
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          IP reputation analysis via VirusTotal & AbuseIPDB
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {threatIntelData.map((entry) => {
            const config = classificationConfig[entry.classification];
            const Icon = config.icon;
            return (
              <div key={entry.ip} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                <div className="flex-shrink-0">
                  <Icon className={cn("h-5 w-5", entry.classification === 'malicious' ? 'text-destructive' : entry.classification === 'suspicious' ? 'text-warning' : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium">{entry.ip}</span>
                    <Badge className={cn(config.color, "text-[10px] px-1.5 py-0")}>
                      {config.label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">{entry.source}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Score: <strong className={entry.reputationScore > 70 ? 'text-destructive' : entry.reputationScore > 40 ? 'text-warning' : 'text-muted-foreground'}>{entry.reputationScore}/100</strong></span>
                    <span>Reports: {entry.totalReports}</span>
                    <span>{entry.country}</span>
                    <span className="truncate">{entry.isp}</span>
                  </div>
                  <Progress value={entry.reputationScore} className="h-1 mt-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
