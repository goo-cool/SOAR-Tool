import { Alert, Playbook } from '@/types/soar';

export const mockAlerts: Alert[] = [
  {
    id: '1',
    name: 'Suspicious Login Attempt',
    sourceIP: '192.168.1.100',
    severity: 'high',
    status: 'new',
    timestamp: '2024-09-01 10:30:45',
    description: 'Multiple failed login attempts detected from suspicious IP',
    whatHappened: 'Our security monitoring detected 15 failed login attempts within 5 minutes from IP address 192.168.1.100. This pattern indicates a potential brute force attack against user accounts.',
    nextSteps: [
      'Block the source IP address',
      'Review affected user accounts',
      'Check for successful logins from this IP',
      'Update threat intelligence feeds'
    ],
    affectedAssets: ['Web Server 01', 'User Database'],
    threatIntel: {
      malwareFamily: 'Unknown',
      confidence: 85,
      iocs: ['192.168.1.100']
    }
  },
  {
    id: '2',
    name: 'Malware Detection',
    sourceIP: '10.0.0.45',
    severity: 'critical',
    status: 'investigating',
    timestamp: '2024-09-01 09:15:22',
    description: 'Trojan.Win32.Agent detected on endpoint',
    whatHappened: 'Advanced malware was detected on workstation WS-001 (10.0.0.45). The malware appears to be communicating with external command and control servers.',
    nextSteps: [
      'Isolate the infected endpoint',
      'Run full system scan',
      'Check network traffic logs',
      'Update antivirus signatures'
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
    description: 'Unusual data transfer pattern detected',
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
    whatHappened: 'Host 172.16.0.22 performed comprehensive port scanning across multiple internal network segments. This could indicate reconnaissance activity or compromised internal system.',
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
    whatHappened: 'Email security gateway blocked a suspicious email containing a malicious PDF attachment. The email was attempting to harvest credentials through a fake login portal.',
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
  }
];

export const defaultPlaybook: Playbook = {
  id: 'pb-001',
  name: 'Incident Response - Malware Detection',
  description: 'Automated response playbook for malware detection and containment',
  estimatedTime: '5-10 minutes',
  triggerConditions: ['Malware Detection', 'Suspicious File Activity'],
  steps: [
    {
      id: 'step-1',
      name: 'Detect Suspicious IP',
      description: 'Analyze network traffic and identify suspicious IP addresses',
      status: 'pending'
    },
    {
      id: 'step-2',
      name: 'Check Threat Intelligence',
      description: 'Query threat intelligence feeds for IP reputation',
      status: 'pending'
    },
    {
      id: 'step-3',
      name: 'Block IP Address',
      description: 'Automatically block malicious IP on firewall',
      status: 'pending'
    },
    {
      id: 'step-4',
      name: 'Log Incident',
      description: 'Create incident record and notify security team',
      status: 'pending'
    }
  ]
};