import { mockAlerts, severityDistribution, alertsOverTime, incidentTimeline } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";

export function SOCVisualization() {
  const stats = {
    total: mockAlerts.length,
    critical: mockAlerts.filter(a => a.severity === 'critical').length,
    investigating: mockAlerts.filter(a => a.status === 'investigating').length,
    resolved: mockAlerts.filter(a => a.status === 'resolved').length + mockAlerts.filter(a => a.status === 'closed').length,
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => (
    <Card className="border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );

  const timelineColors: Record<string, string> = {
    detection: 'bg-destructive',
    response: 'bg-primary',
    containment: 'bg-warning',
    resolution: 'bg-success',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Module 4 – SOC Dashboard</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Alerts" value={stats.total} icon={Activity} color="bg-primary/20 text-primary" />
        <StatCard title="Critical Alerts" value={stats.critical} icon={AlertTriangle} color="bg-destructive/20 text-destructive" />
        <StatCard title="Investigating" value={stats.investigating} icon={Clock} color="bg-warning/20 text-warning" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="bg-success/20 text-success" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Severity Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alert Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={2} stroke="hsl(var(--background))">
                    {severityDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {severityDistribution.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                  <span className="text-muted-foreground">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts over time */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alerts Over Time (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={alertsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Area type="monotone" dataKey="alerts" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Timeline */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Incident Timeline – Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border" />
            <div className="space-y-3">
              {incidentTimeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3 group">
                  <span className="text-[11px] font-mono text-muted-foreground w-10 pt-0.5 text-right shrink-0">{event.timestamp}</span>
                  <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ring-2 ring-background relative z-10", timelineColors[event.type])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{event.title}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0">{event.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
