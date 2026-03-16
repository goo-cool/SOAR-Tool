import { Alert, Playbook } from '@/types/soar';

export const mockAlerts: Alert[] = [
  {
    id: '1',
    name: 'Brute Force Login Attempt',
    sourceIP: '192.168.1.100',
    severity: 'critical',
    status: 'new',
    timestamp: '2024-09-01 10:30:45',
    description: 'Multiple failed login attempts detected from suspicious IP',
    whatHappened: 'Our security monitoring detected 47 failed login attempts within 3 minutes from IP address 192.168.1.100. This pattern indicates a brute force attack against the admin portal.',
    nextSteps: [
      'Block the source IP address immediately',
      'Review affected user accounts for compromise',
      'Check for successful logins from this IP',
      'Update firewall rules and threat intelligence feeds'
    ],
    affectedAssets: ['Web Server 01', 'Admin Portal', 'User Database'],
    threatIntel: {
      malwareFamily: 'Unknown',
      confidence: 92,
      iocs: ['192.168.1.100']
    }
  },
  {
    id: '2',
    name: 'Malware C2 Communication',
    sourceIP: '10.0.0.45',
    severity: 'critical',
    status: 'investigating',
    timestamp: '2024-09-01 09:15:22',
    description: 'Trojan.Win32.Agent detected communicating with C2 server',
    whatHappened: 'Advanced malware was detected on workstation WS-001 (10.0.0.45). The malware is actively communicating with command and control servers at c2server.evil.com.',
    nextSteps: [
      'Isolate the infected endpoint immediately',
      'Run full system scan on adjacent hosts',
      'Block C2 domains at DNS level',
      'Update antivirus signatures network-wide'
    ],
    affectedAssets: ['Workstation WS-001'],
    threatIntel: {
      malwareFamily: 'Trojan.Win32.Agent',
      confidence: 95,
      iocs: ['malware_hash_abc123', 'c2server.evil.com']
    }
  },
  {
    id: '3',
    name: 'Data Exfiltration Attempt',
    sourceIP: '203.45.67.89',
    severity: 'critical',
    status: 'new',
    timestamp: '2024-09-01 11:45:12',
    description: 'Unusual data transfer pattern detected to external IP',
    whatHappened: 'Large amounts of data (2.3GB) were transferred to an external IP address during non-business hours. This pattern is consistent with data exfiltration attempts.',
    nextSteps: [
      'Block external IP immediately',
      'Analyze transferred data content',
      'Check user activity logs',
      'Notify data protection team'
    ],
    affectedAssets: ['File Server FS-001', 'Network Gateway'],
    threatIntel: {
      confidence: 78,
      iocs: ['203.45.67.89']
    }
  },
  {
    id: '4',
    name: 'Port Scan Activity',
    sourceIP: '172.16.0.22',
    severity: 'medium',
    status: 'resolved',
    timestamp: '2024-09-01 08:22:15',
    description: 'Network port scanning detected from internal host',
    whatHappened: 'Host 172.16.0.22 performed comprehensive port scanning across multiple internal network segments.',
    nextSteps: [
      'Investigate host 172.16.0.22',
      'Check for unauthorized software',
      'Review network access policies',
      'Monitor for lateral movement'
    ],
    affectedAssets: ['Internal Network Segments'],
    threatIntel: {
      confidence: 60,
      iocs: ['172.16.0.22']
    }
  },
  {
    id: '5',
    name: 'Phishing Email Detected',
    sourceIP: '198.51.100.42',
    severity: 'low',
    status: 'closed',
    timestamp: '2024-09-01 07:30:00',
    description: 'Suspicious email with malicious attachment blocked',
    whatHappened: 'Email security gateway blocked a suspicious email containing a malicious PDF attachment targeting credentials.',
    nextSteps: [
      'Update email filters',
      'Notify users about phishing attempt',
      'Add sender to blacklist',
      'Review similar emails'
    ],
    affectedAssets: ['Email Gateway'],
    threatIntel: {
      confidence: 90,
      iocs: ['malicious_pdf_hash_xyz789', 'phishing_domain.com']
    }
  },
  {
    id: '6',
    name: 'Failed SSH Authentication',
    sourceIP: '45.33.32.156',
    severity: 'high',
    status: 'investigating',
    timestamp: '2024-09-01 06:12:33',
    description: 'Repeated SSH login failures on production servers',
    whatHappened: '32 failed SSH login attempts from external IP 45.33.32.156 targeting root account on production servers.',
    nextSteps: [
      'Block source IP on edge firewall',
      'Enable SSH key-only authentication',
      'Audit SSH access logs',
      'Consider implementing fail2ban'
    ],
    affectedAssets: ['Prod Server 01', 'Prod Server 02'],
    threatIntel: {
      confidence: 88,
      iocs: ['45.33.32.156']
    }
  },
  {
    id: '7',
    name: 'DNS Tunneling Detected',
    sourceIP: '10.0.2.15',
    severity: 'high',
    status: 'new',
    timestamp: '2024-09-01 12:05:48',
    description: 'Anomalous DNS query patterns suggesting DNS tunneling',
    whatHappened: 'Endpoint 10.0.2.15 generated 4,200 DNS queries with unusually long subdomain labels in 10 minutes, consistent with DNS tunneling for data exfiltration.',
    nextSteps: [
      'Block suspicious DNS domains',
      'Isolate affected endpoint',
      'Analyze DNS query payloads',
      'Review DNS security policies'
    ],
    affectedAssets: ['Workstation WS-015', 'DNS Server'],
    threatIntel: {
      confidence: 82,
      iocs: ['10.0.2.15', 'tunnel.suspicious-domain.xyz']
    }
  }
];

// Module 1: Auth log entries for threat detection
export interface AuthLogEntry {
  id: string;
  timestamp: string;
  sourceIP: string;
  eventType: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'failed' | 'success' | 'blocked';
  username: string;
  details: string;
}

export const authLogEntries: AuthLogEntry[] = [
  { id: 'log-1', timestamp: 'Mar 16 10:30:45', sourceIP: '192.168.1.20', eventType: 'Failed SSH Login', severity: 'high', status: 'failed', username: 'root', details: 'Failed password for root from 192.168.1.20 port 4521 ssh2' },
  { id: 'log-2', timestamp: 'Mar 16 10:30:46', sourceIP: '192.168.1.20', eventType: 'Failed SSH Login', severity: 'high', status: 'failed', username: 'admin', details: 'Failed password for admin from 192.168.1.20 port 4522 ssh2' },
  { id: 'log-3', timestamp: 'Mar 16 10:30:47', sourceIP: '192.168.1.20', eventType: 'Failed SSH Login', severity: 'critical', status: 'failed', username: 'root', details: 'Failed password for root from 192.168.1.20 port 4523 ssh2' },
  { id: 'log-4', timestamp: 'Mar 16 10:30:48', sourceIP: '192.168.1.20', eventType: 'Brute Force Detected', severity: 'critical', status: 'blocked', username: 'root', details: '🚨 ALERT: 192.168.1.20 failed 47 times (Threshold = 3)' },
  { id: 'log-5', timestamp: 'Mar 16 10:30:50', sourceIP: '192.168.1.30', eventType: 'Failed SSH Login', severity: 'high', status: 'failed', username: 'ubuntu', details: 'Failed password for ubuntu from 192.168.1.30 port 5012 ssh2' },
  { id: 'log-6', timestamp: 'Mar 16 10:31:02', sourceIP: '192.168.1.30', eventType: 'Failed SSH Login', severity: 'high', status: 'failed', username: 'test', details: 'Failed password for test from 192.168.1.30 port 5013 ssh2' },
  { id: 'log-7', timestamp: 'Mar 16 10:31:15', sourceIP: '192.168.1.40', eventType: 'Accepted Login', severity: 'info', status: 'success', username: 'admin', details: 'Accepted password for admin from 192.168.1.40 port 4100 ssh2' },
  { id: 'log-8', timestamp: 'Mar 16 10:31:30', sourceIP: '192.168.1.50', eventType: 'Failed SSH Login', severity: 'medium', status: 'failed', username: 'root', details: 'Failed password for root from 192.168.1.50 port 5500 ssh2' },
  { id: 'log-9', timestamp: 'Mar 16 10:32:00', sourceIP: '192.168.1.20', eventType: 'IP Blocked', severity: 'critical', status: 'blocked', username: 'SYSTEM', details: 'iptables -A INPUT -s 192.168.1.20 -j DROP' },
  { id: 'log-10', timestamp: 'Mar 16 10:32:15', sourceIP: '192.168.1.60', eventType: 'Failed SSH Login', severity: 'medium', status: 'failed', username: 'ubuntu', details: 'Failed password for ubuntu from 192.168.1.60 port 5801 ssh2' },
];

// Module 2: Threat intelligence data
export interface ThreatIntelEntry {
  ip: string;
  reputationScore: number;
  totalReports: number;
  classification: 'malicious' | 'suspicious' | 'clean' | 'unknown';
  source: string;
  lastSeen: string;
  country: string;
  isp: string;
  categories: string[];
}

export const threatIntelData: ThreatIntelEntry[] = [
  { ip: '192.168.1.100', reputationScore: 92, totalReports: 156, classification: 'malicious', source: 'VirusTotal', lastSeen: '2024-09-01', country: 'CN', isp: 'ChinaNet', categories: ['Brute Force', 'Scanner', 'Proxy'] },
  { ip: '45.33.32.156', reputationScore: 85, totalReports: 89, classification: 'malicious', source: 'AbuseIPDB', lastSeen: '2024-09-01', country: 'US', isp: 'Linode LLC', categories: ['SSH Brute Force', 'Web Attack'] },
  { ip: '203.45.67.89', reputationScore: 78, totalReports: 42, classification: 'suspicious', source: 'VirusTotal', lastSeen: '2024-08-30', country: 'RU', isp: 'PJSC Rostelecom', categories: ['Data Exfiltration', 'Botnet'] },
  { ip: '10.0.0.45', reputationScore: 15, totalReports: 0, classification: 'unknown', source: 'Internal', lastSeen: '2024-09-01', country: 'Internal', isp: 'Internal Network', categories: ['Compromised Host'] },
  { ip: '172.16.0.22', reputationScore: 35, totalReports: 3, classification: 'suspicious', source: 'AbuseIPDB', lastSeen: '2024-09-01', country: 'Internal', isp: 'Internal Network', categories: ['Scanner'] },
  { ip: '10.0.2.15', reputationScore: 45, totalReports: 7, classification: 'suspicious', source: 'Internal', lastSeen: '2024-09-01', country: 'Internal', isp: 'Internal Network', categories: ['DNS Tunneling'] },
];

// Incident timeline data
export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'detection' | 'response' | 'containment' | 'resolution';
}

export const incidentTimeline: IncidentTimelineEntry[] = [
  { id: 'tl-1', timestamp: '06:12', title: 'SSH Brute Force Detected', description: 'Multiple failed SSH logins from 45.33.32.156', severity: 'high', type: 'detection' },
  { id: 'tl-2', timestamp: '07:30', title: 'Phishing Email Blocked', description: 'Malicious PDF attachment quarantined', severity: 'low', type: 'containment' },
  { id: 'tl-3', timestamp: '08:22', title: 'Port Scan Detected', description: 'Internal host scanning network segments', severity: 'medium', type: 'detection' },
  { id: 'tl-4', timestamp: '08:45', title: 'Port Scan Resolved', description: 'False positive – authorized vulnerability scan', severity: 'medium', type: 'resolution' },
  { id: 'tl-5', timestamp: '09:15', title: 'Malware C2 Communication', description: 'Trojan detected on WS-001, C2 traffic blocked', severity: 'critical', type: 'detection' },
  { id: 'tl-6', timestamp: '09:30', title: 'Endpoint Isolated', description: 'WS-001 quarantined from network', severity: 'critical', type: 'containment' },
  { id: 'tl-7', timestamp: '10:30', title: 'Brute Force Attack', description: '47 failed logins in 3 minutes – IP blocked', severity: 'critical', type: 'detection' },
  { id: 'tl-8', timestamp: '10:35', title: 'Attacker IP Blocked', description: 'Firewall rule added for 192.168.1.100', severity: 'critical', type: 'response' },
  { id: 'tl-9', timestamp: '11:45', title: 'Data Exfiltration Attempt', description: '2.3GB suspicious transfer detected and blocked', severity: 'critical', type: 'detection' },
  { id: 'tl-10', timestamp: '12:05', title: 'DNS Tunneling Detected', description: 'Anomalous DNS patterns from 10.0.2.15', severity: 'high', type: 'detection' },
];

// Alert severity distribution for chart
export const severityDistribution = [
  { name: 'Critical', value: 3, fill: 'hsl(0, 84%, 60%)' },
  { name: 'High', value: 3, fill: 'hsl(25, 95%, 53%)' },
  { name: 'Medium', value: 1, fill: 'hsl(38, 92%, 50%)' },
  { name: 'Low', value: 1, fill: 'hsl(142, 76%, 36%)' },
];

// Alerts over time for chart
export const alertsOverTime = [
  { hour: '00:00', alerts: 2, critical: 0 },
  { hour: '02:00', alerts: 1, critical: 0 },
  { hour: '04:00', alerts: 3, critical: 1 },
  { hour: '06:00', alerts: 5, critical: 1 },
  { hour: '08:00', alerts: 8, critical: 2 },
  { hour: '10:00', alerts: 12, critical: 4 },
  { hour: '12:00', alerts: 9, critical: 3 },
  { hour: '14:00', alerts: 6, critical: 1 },
  { hour: '16:00', alerts: 4, critical: 1 },
  { hour: '18:00', alerts: 3, critical: 0 },
  { hour: '20:00', alerts: 2, critical: 0 },
  { hour: '22:00', alerts: 1, critical: 0 },
];

export const defaultPlaybook: Playbook = {
  id: 'pb-001',
  name: 'Automated Incident Response – Brute Force Attack',
  description: 'End-to-end automated response playbook for brute force login detection, threat intelligence validation, firewall blocking, and incident logging.',
  estimatedTime: '5-10 minutes',
  triggerConditions: ['Brute Force Detection', 'Failed Login Threshold Exceeded', 'Suspicious IP Activity'],
  steps: [
    {
      id: 'step-1',
      name: 'Detect Suspicious IP',
      description: 'Analyze authentication logs to identify IP addresses with abnormal failed login patterns exceeding threshold (>10 failures in 5 minutes).',
      status: 'pending'
    },
    {
      id: 'step-2',
      name: 'Validate with Threat Intelligence',
      description: 'Query VirusTotal and AbuseIPDB APIs to check IP reputation score, abuse history, and geographic origin.',
      status: 'pending'
    },
    {
      id: 'step-3',
      name: 'Block Attacker IP on Firewall',
      description: 'Automatically push firewall rule to block the malicious IP address on perimeter and internal firewalls.',
      status: 'pending'
    },
    {
      id: 'step-4',
      name: 'Log Incident & Notify SOC',
      description: 'Create incident ticket in ITSM system, log all evidence, and send notification to SOC team via email and Slack.',
      status: 'pending'
    }
  ]
};
