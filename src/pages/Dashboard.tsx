import { useState } from "react";
import { Alert } from "@/types/soar";
import { mockAlerts, defaultPlaybook } from "@/data/mockData";
import { AlertsTable } from "@/components/dashboard/AlertsTable";
import { AlertDetailsPanel } from "@/components/dashboard/AlertDetailsPanel";
import { PlaybookVisualization } from "@/components/playbooks/PlaybookVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  const alertStats = {
    total: mockAlerts.length,
    critical: mockAlerts.filter(a => a.severity === 'critical').length,
    high: mockAlerts.filter(a => a.severity === 'high').length,
    new: mockAlerts.filter(a => a.status === 'new').length,
    investigating: mockAlerts.filter(a => a.status === 'investigating').length,
    resolved: mockAlerts.filter(a => a.status === 'resolved').length
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = "text-foreground" 
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    trend?: string;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-xs text-muted-foreground">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SOAR Dashboard</h1>
          <p className="text-muted-foreground">
            Security Operations & Automated Response
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Live Monitoring</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Alerts"
          value={alertStats.total}
          icon={Activity}
          trend="+2.5% from yesterday"
        />
        <StatCard
          title="Critical/High"
          value={alertStats.critical + alertStats.high}
          icon={AlertTriangle}
          color="text-destructive"
          trend="+1 critical today"
        />
        <StatCard
          title="Under Investigation"
          value={alertStats.investigating}
          icon={Clock}
          color="text-warning"
        />
        <StatCard
          title="Resolved Today"
          value={alertStats.resolved}
          icon={CheckCircle}
          color="text-success"
          trend="85% resolution rate"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts and Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="alerts" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Security Alerts
                <Badge variant="secondary" className="ml-1">
                  {alertStats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="playbook" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Automated Response
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="space-y-4">
              <AlertsTable
                alerts={mockAlerts}
                onAlertSelect={setSelectedAlert}
                selectedAlertId={selectedAlert?.id}
              />
            </TabsContent>
            
            <TabsContent value="playbook" className="space-y-4">
              <PlaybookVisualization playbook={defaultPlaybook} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Alert Details Panel */}
        <div className="lg:col-span-1">
          <AlertDetailsPanel alert={selectedAlert} />
        </div>
      </div>
    </div>
  );
}