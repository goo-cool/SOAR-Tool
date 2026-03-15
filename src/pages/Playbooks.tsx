import { useState } from "react";
import { Playbook } from "@/types/soar";
import { PlaybookVisualization } from "@/components/playbooks/PlaybookVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workflow, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const playbooks: Playbook[] = [
  {
    id: 'pb-001',
    name: 'Brute Force Response',
    description: 'Automated response for brute force login detection – detects, validates, blocks, and logs.',
    estimatedTime: '5-10 minutes',
    triggerConditions: ['Brute Force Detection', 'Failed Login Threshold Exceeded'],
    steps: [
      { id: 's1', name: 'Detect Suspicious IP', description: 'Analyze authentication logs to identify IPs with abnormal failed login patterns exceeding threshold (>10 failures in 5 min).', status: 'pending' },
      { id: 's2', name: 'Validate with Threat Intelligence', description: 'Query VirusTotal and AbuseIPDB APIs for IP reputation score, abuse history, and geographic origin.', status: 'pending' },
      { id: 's3', name: 'Block Attacker IP on Firewall', description: 'Push firewall rule to block the malicious IP on perimeter and internal firewalls.', status: 'pending' },
      { id: 's4', name: 'Log Incident & Notify SOC', description: 'Create incident ticket, log evidence, and notify SOC team via email and Slack.', status: 'pending' },
    ],
  },
  {
    id: 'pb-002',
    name: 'Malware Containment',
    description: 'Isolate infected endpoint, scan adjacent hosts, block C2 domains, and update signatures.',
    estimatedTime: '10-15 minutes',
    triggerConditions: ['Malware Detection', 'C2 Communication Detected'],
    steps: [
      { id: 's1', name: 'Alert Detected', description: 'Malware C2 communication detected by network monitor on endpoint.', status: 'pending' },
      { id: 's2', name: 'Isolate Endpoint', description: 'Quarantine the infected host from the network to prevent lateral movement.', status: 'pending' },
      { id: 's3', name: 'Scan Adjacent Hosts', description: 'Run full scans on hosts in the same network segment for signs of compromise.', status: 'pending' },
      { id: 's4', name: 'Block C2 Domains', description: 'Add C2 domains to DNS blocklist and firewall rules.', status: 'pending' },
      { id: 's5', name: 'Update AV Signatures', description: 'Push updated antivirus definitions network-wide and log incident.', status: 'pending' },
    ],
  },
  {
    id: 'pb-003',
    name: 'Phishing Response',
    description: 'Quarantine phishing email, extract IOCs, block sender domain, and notify affected users.',
    estimatedTime: '8-12 minutes',
    triggerConditions: ['Phishing Email Detected', 'Malicious Attachment Found'],
    steps: [
      { id: 's1', name: 'Quarantine Email', description: 'Move suspicious email to quarantine and prevent delivery to other recipients.', status: 'pending' },
      { id: 's2', name: 'Extract IOCs', description: 'Analyze email headers, URLs, and attachments to extract indicators of compromise.', status: 'pending' },
      { id: 's3', name: 'Block Sender Domain', description: 'Add sender domain and embedded URLs to email gateway blocklist.', status: 'pending' },
      { id: 's4', name: 'Notify Users', description: 'Send security advisory to affected users and log the incident.', status: 'pending' },
    ],
  },
  {
    id: 'pb-004',
    name: 'Data Exfiltration Response',
    description: 'Detect abnormal data transfers, verify with DLP, block destination, and escalate to IR team.',
    estimatedTime: '7-10 minutes',
    triggerConditions: ['Large Data Transfer', 'DLP Alert Triggered'],
    steps: [
      { id: 's1', name: 'Detect Anomalous Transfer', description: 'Identify unusually large outbound data transfers during non-business hours.', status: 'pending' },
      { id: 's2', name: 'Reputation Verified', description: 'Check destination IP/domain against threat intelligence feeds.', status: 'pending' },
      { id: 's3', name: 'Response Action Triggered', description: 'Block destination IP on firewall and revoke user session tokens.', status: 'pending' },
      { id: 's4', name: 'Incident Logged', description: 'Create IR ticket with full evidence chain and notify data protection team.', status: 'pending' },
    ],
  },
];

export default function Playbooks() {
  const [selectedId, setSelectedId] = useState<string>(playbooks[0].id);
  const selected = playbooks.find(p => p.id === selectedId)!;

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Workflow className="h-8 w-8 text-primary" />
          Playbooks
        </h1>
        <p className="text-muted-foreground mt-1">
          Automated incident response playbooks – Select a playbook and click "Run Playbook" to simulate
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Playbook List */}
        <div className="lg:col-span-1 space-y-2">
          {playbooks.map((pb) => (
            <Card
              key={pb.id}
              className={cn(
                "cursor-pointer transition-all border-border hover:border-primary/50",
                selectedId === pb.id && "border-primary bg-primary/5"
              )}
              onClick={() => setSelectedId(pb.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">{pb.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{pb.steps.length} steps · {pb.estimatedTime}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pb.triggerConditions.slice(0, 2).map((t, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground", selectedId === pb.id && "text-primary")} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Playbook Visualization */}
        <div className="lg:col-span-3">
          <PlaybookVisualization key={selected.id} playbook={selected} />
        </div>
      </div>
    </div>
  );
}
