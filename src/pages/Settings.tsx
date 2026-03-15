import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Bell, Database, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure SOAR tool preferences and integrations</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary" />
              Alert Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email notifications</span>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Slack integration</span>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Critical alert escalation</span>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Threat Intelligence Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm">VirusTotal API</span>
                <Badge variant="outline" className="ml-2 text-[9px]">Connected</Badge>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm">AbuseIPDB</span>
                <Badge variant="outline" className="ml-2 text-[9px]">Connected</Badge>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-primary" />
              Detection Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Brute force threshold</span>
              <span className="text-sm font-mono text-muted-foreground">10 attempts / 5 min</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-block malicious IPs</span>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              SOC Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active analysts</span>
              <span className="text-sm font-mono text-muted-foreground">3 online</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Shift rotation</span>
              <span className="text-sm font-mono text-muted-foreground">8 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
