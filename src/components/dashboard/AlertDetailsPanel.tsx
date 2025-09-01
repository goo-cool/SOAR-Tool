import { Alert } from "@/types/soar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Clock, 
  Shield, 
  CheckCircle, 
  Server, 
  Eye,
  TrendingUp,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertDetailsPanelProps {
  alert: Alert | null;
}

const severityConfig = {
  critical: { 
    color: 'bg-severity-critical text-white', 
    icon: AlertTriangle, 
    label: 'Critical' 
  },
  high: { 
    color: 'bg-severity-high text-white', 
    icon: AlertTriangle, 
    label: 'High' 
  },
  medium: { 
    color: 'bg-severity-medium text-white', 
    icon: Shield, 
    label: 'Medium' 
  },
  low: { 
    color: 'bg-severity-low text-white', 
    label: 'Low' 
  },
  info: { 
    color: 'bg-severity-info text-white', 
    label: 'Info' 
  }
};

const statusConfig = {
  new: { 
    color: 'bg-status-new text-white', 
    icon: Clock, 
    label: 'New' 
  },
  investigating: { 
    color: 'bg-status-investigating text-white', 
    icon: Shield, 
    label: 'Investigating' 
  },
  resolved: { 
    color: 'bg-status-resolved text-white', 
    icon: CheckCircle, 
    label: 'Resolved' 
  },
  closed: { 
    color: 'bg-status-closed text-white', 
    label: 'Closed' 
  }
};

export function AlertDetailsPanel({ alert }: AlertDetailsPanelProps) {
  if (!alert) {
    return (
      <Card className="border-border h-full">
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select an alert to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const severityConfig_ = severityConfig[alert.severity];
  const statusConfig_ = statusConfig[alert.status];
  const SeverityIcon = 'icon' in severityConfig_ ? severityConfig_.icon : undefined;
  const StatusIcon = 'icon' in statusConfig_ ? statusConfig_.icon : undefined;

  return (
    <Card className="border-border h-full overflow-auto">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{alert.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={cn(severityConfig_.color, "flex items-center gap-1")}>
                {SeverityIcon && <SeverityIcon className="h-3 w-3" />}
                {severityConfig_.label}
              </Badge>
              <Badge variant="outline" className={cn(statusConfig_.color, "flex items-center gap-1")}>
                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                {statusConfig_.label}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {alert.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Source IP:</span>
              <div className="font-mono mt-1">{alert.sourceIP}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Timestamp:</span>
              <div className="mt-1">{alert.timestamp}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* What Happened */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            What Happened
          </h3>
          <p className="text-sm leading-relaxed">{alert.whatHappened}</p>
        </div>

        <Separator />

        {/* Next Steps */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <List className="h-4 w-4" />
            Next Steps
          </h3>
          <ul className="space-y-2">
            {alert.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="h-2 w-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Affected Assets */}
        {alert.affectedAssets && alert.affectedAssets.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Affected Assets
              </h3>
              <div className="flex flex-wrap gap-2">
                {alert.affectedAssets.map((asset, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Threat Intelligence */}
        {alert.threatIntel && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Threat Intelligence
              </h3>
              <div className="space-y-3 text-sm">
                {alert.threatIntel.malwareFamily && (
                  <div>
                    <span className="text-muted-foreground">Malware Family:</span>
                    <div className="font-medium mt-1">{alert.threatIntel.malwareFamily}</div>
                  </div>
                )}
                {alert.threatIntel.confidence && (
                  <div>
                    <span className="text-muted-foreground">Confidence Level:</span>
                    <div className="mt-1">
                      <Badge variant={alert.threatIntel.confidence > 80 ? "destructive" : "secondary"}>
                        {alert.threatIntel.confidence}%
                      </Badge>
                    </div>
                  </div>
                )}
                {alert.threatIntel.iocs && alert.threatIntel.iocs.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">IoCs:</span>
                    <div className="mt-2 space-y-1">
                      {alert.threatIntel.iocs.map((ioc, index) => (
                        <div key={index} className="font-mono text-xs bg-muted p-2 rounded">
                          {ioc}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}