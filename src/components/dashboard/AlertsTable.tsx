import { useState } from "react";
import { Alert } from "@/types/soar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Shield, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertsTableProps {
  alerts: Alert[];
  onAlertSelect: (alert: Alert) => void;
  selectedAlertId?: string;
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

export function AlertsTable({ alerts, onAlertSelect, selectedAlertId }: AlertsTableProps) {
  const getSeverityBadge = (severity: Alert['severity']) => {
    const config = severityConfig[severity];
    const IconComponent = 'icon' in config ? config.icon : undefined;
    
    return (
      <Badge className={cn(config.color, "flex items-center gap-1")}>
        {IconComponent && <IconComponent className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: Alert['status']) => {
    const config = statusConfig[status];
    const IconComponent = 'icon' in config ? config.icon : undefined;
    
    return (
      <Badge variant="outline" className={cn(config.color, "flex items-center gap-1")}>
        {IconComponent && <IconComponent className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Security Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-semibold">Alert Name</TableHead>
                <TableHead className="font-semibold">Source IP</TableHead>
                <TableHead className="font-semibold">Severity</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className={cn(
                    "cursor-pointer border-border transition-all duration-200",
                    "hover:bg-muted/50",
                    selectedAlertId === alert.id 
                      ? "bg-primary/10 border-l-4 border-l-primary" 
                      : ""
                  )}
                  onClick={() => onAlertSelect(alert)}
                >
                  <TableCell className="font-medium">
                    {alert.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {alert.sourceIP}
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(alert.severity)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(alert.status)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {alert.timestamp}
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