"""
SOAR Tool for Automated Security Operations – v3
Enhanced with real-world playbooks inspired by:
  - Rapid7 InsightConnect Automation Playbook
  - Splunk SOAR / Phantom
  - Swimlane SOAR Capabilities Guide
  - SOAR Buyer's Guide (Logsign)
  - ISACA Tech Talk on SOAR

Playbooks implemented:
  1. SSH Brute-Force Response
  2. Phishing Email Triage
  3. Malware Containment
  4. Alert Enrichment / Threat Intel
  5. Insider Threat Detection
  6. Vulnerability Management
"""

from flask import Flask, render_template, jsonify, request
import markupsafe
import re, os, json, random
from datetime import datetime, timedelta
from collections import defaultdict

app = Flask(__name__)

# Make tojson safe in templates
import json as _json
app.jinja_env.filters['tojson'] = lambda v, **kw: markupsafe.Markup(_json.dumps(v, **kw))

# ═══════════════════════════════════════════════
# GLOBAL PATHS & CONFIG
# ═══════════════════════════════════════════════
BASE_DIR      = os.path.dirname(__file__)
AUTH_LOG      = os.path.join(BASE_DIR, "auth.log")
DNS_LOG       = os.path.join(BASE_DIR, "dns.log")
EMAIL_LOG     = os.path.join(BASE_DIR, "email_alerts.csv")
INCIDENT_LOG  = os.path.join(BASE_DIR, "incidents.json")

BRUTE_THRESHOLD = 5

# ═══════════════════════════════════════════════
# SIMULATED THREAT INTELLIGENCE DATABASE
# ═══════════════════════════════════════════════
THREAT_INTEL = {
    "192.168.1.105": {
        "reputation": "Malicious", "score": 95,
        "country": "Unknown", "asn": "AS64496",
        "tags": ["brute-force", "credential-stuffing"],
        "isp": "Unknown ISP",
        "description": "Known SSH brute-force actor across multiple honeypots.",
        "source": "AbuseIPDB",
    },
    "203.0.113.50": {
        "reputation": "Malicious", "score": 88,
        "country": "CN", "asn": "AS4134",
        "tags": ["scanner", "brute-force"],
        "isp": "China Telecom",
        "description": "Automated scanner with repeated authentication failures.",
        "source": "VirusTotal",
    },
    "10.0.0.47": {
        "reputation": "Suspicious", "score": 65,
        "country": "Private", "asn": "RFC1918",
        "tags": ["internal-anomaly"],
        "isp": "Internal Network",
        "description": "Internal IP showing anomalous login pattern.",
        "source": "Internal SIEM",
    },
    "172.16.0.88": {
        "reputation": "Suspicious", "score": 70,
        "country": "Private", "asn": "RFC1918",
        "tags": ["insider-threat"],
        "isp": "Internal Network",
        "description": "Internal IP flagged for off-hours activity.",
        "source": "UEBA",
    },
    "45.33.32.156": {
        "reputation": "Malicious", "score": 92,
        "country": "US", "asn": "AS63949",
        "tags": ["known-attacker", "scanner"],
        "isp": "Linode LLC",
        "description": "Publicly known Shodan scanning host.",
        "source": "Shodan",
    },
    "185.220.101.5": {
        "reputation": "Malicious", "score": 98,
        "country": "DE", "asn": "AS60729",
        "tags": ["tor-exit", "phishing-sender"],
        "isp": "Tor Project",
        "description": "Active Tor exit node used for phishing campaigns.",
        "source": "ThreatFox",
    },
    "198.51.100.77": {
        "reputation": "Suspicious", "score": 55,
        "country": "RU", "asn": "AS15169",
        "tags": ["spam", "botnet-c2"],
        "isp": "Unknown AS",
        "description": "Listed in multiple spam blacklists.",
        "source": "Spamhaus",
    },
    "54.36.149.105": {
        "reputation": "Suspicious", "score": 62,
        "country": "FR", "asn": "AS16276",
        "tags": ["crawler", "recon"],
        "isp": "OVH SAS",
        "description": "Aggressive web crawler associated with reconnaissance.",
        "source": "AbuseIPDB",
    },
}

CVE_DATABASE = [
    {"cve": "CVE-2024-1234", "severity": "CRITICAL", "score": 9.8, "product": "OpenSSH < 9.6",   "description": "Remote code execution via heap overflow in SSH protocol negotiation.", "patch": "Upgrade to OpenSSH 9.6+"},
    {"cve": "CVE-2024-5678", "severity": "HIGH",     "score": 8.1, "product": "Apache 2.4.49",   "description": "Path traversal vulnerability allowing directory listing.", "patch": "Upgrade Apache to 2.4.50+"},
    {"cve": "CVE-2023-9101", "severity": "HIGH",     "score": 7.5, "product": "log4j 2.14.1",    "description": "Remote code execution via JNDI lookup (Log4Shell variant).", "patch": "Upgrade log4j to 2.17+"},
    {"cve": "CVE-2024-2233", "severity": "MEDIUM",   "score": 6.4, "product": "nginx 1.18.0",    "description": "HTTP request smuggling via malformed chunked encoding.", "patch": "Upgrade nginx to 1.25+"},
    {"cve": "CVE-2023-4455", "severity": "MEDIUM",   "score": 5.9, "product": "Python 3.9 ssl",  "description": "TLS certificate verification bypass in urllib.", "patch": "Upgrade to Python 3.11+"},
]

# ═══════════════════════════════════════════════
# HELPER UTILITIES
# ═══════════════════════════════════════════════
def now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def incident_id(prefix="INC"):
    return f"{prefix}-{random.randint(10000, 99999)}"

def severity_from_score(score):
    if score >= 90: return "CRITICAL"
    if score >= 75: return "HIGH"
    if score >= 50: return "MEDIUM"
    return "LOW"

def enrich_ip(ip):
    return THREAT_INTEL.get(ip, {
        "reputation": "Unknown", "score": 20,
        "country": "Unknown", "asn": "Unknown",
        "tags": ["unclassified"], "isp": "Unknown",
        "description": "No threat intelligence data available.",
        "source": "None",
    })

def save_incident(record):
    incidents = []
    if os.path.exists(INCIDENT_LOG):
        try:
            with open(INCIDENT_LOG) as f:
                incidents = json.load(f)
        except Exception:
            pass
    incidents.append(record)
    with open(INCIDENT_LOG, "w") as f:
        json.dump(incidents, f, indent=2)

# ═══════════════════════════════════════════════
# PLAYBOOK 1 – SSH BRUTE-FORCE RESPONSE
# (Inspired by Rapid7 Playbook + Project Brief)
# ═══════════════════════════════════════════════
def playbook_ssh_brute_force():
    failed_re = re.compile(r"Failed password for (?:invalid user )?\S+ from ([\d.]+)")
    count_map = defaultdict(int)
    total_lines = 0

    if os.path.exists(AUTH_LOG):
        with open(AUTH_LOG) as f:
            for line in f:
                total_lines += 1
                m = failed_re.search(line)
                if m:
                    count_map[m.group(1)] += 1

    results = []
    for ip, count in sorted(count_map.items(), key=lambda x: -x[1]):
        if count < BRUTE_THRESHOLD:
            continue
        intel = enrich_ip(ip)
        sev   = "CRITICAL" if count >= 15 else ("HIGH" if count >= 10 else "MEDIUM")
        rep   = intel["reputation"]

        if rep == "Malicious":
            actions = [
                f"iptables -A INPUT -s {ip} -j DROP  [SIMULATED]",
                f"Firewall rule updated – block {ip} on all ports",
                f"SOC analyst notified via PagerDuty  [SIMULATED]",
                f"JIRA ticket created: {incident_id('INC')}",
                f"IP added to blocklist feed",
            ]
            pb_status = "BLOCKED"; color = "danger"
        elif rep == "Suspicious":
            actions = [
                f"Rate-limiting applied to {ip} (10 req/min)  [SIMULATED]",
                f"SIEM watchlist updated for {ip}",
                f"Enhanced logging enabled on perimeter firewall",
                f"Analyst review requested",
            ]
            pb_status = "RATE-LIMITED"; color = "warning"
        else:
            actions = [f"IP {ip} added to monitoring watchlist", "Alert logged for analyst review"]
            pb_status = "MONITORING"; color = "info"

        iid = incident_id("SSH")
        results.append({
            "incident_id": iid,
            "ip": ip, "failed_attempts": count,
            "severity": sev, "reputation": rep,
            "score": intel["score"], "country": intel["country"],
            "asn": intel["asn"], "tags": intel["tags"],
            "isp": intel["isp"], "description": intel["description"],
            "source": intel["source"],
            "playbook_status": pb_status, "color": color,
            "actions": actions,
            "playbook": "SSH_BruteForce_Response_v1.0",
            "timestamp": now_str(),
        })
        save_incident({"id": iid, "type": "SSH Brute-Force", "ip": ip,
                       "severity": sev, "status": pb_status, "ts": now_str()})

    return {
        "name": "SSH Brute-Force Response",
        "icon": "🔐",
        "total_log_lines": total_lines,
        "alerts": results,
        "stats": {
            "total":    len(results),
            "critical": sum(1 for r in results if r["severity"]   == "CRITICAL"),
            "high":     sum(1 for r in results if r["severity"]   == "HIGH"),
            "blocked":  sum(1 for r in results if r["playbook_status"] == "BLOCKED"),
            "malicious":sum(1 for r in results if r["reputation"] == "Malicious"),
        }
    }

# ═══════════════════════════════════════════════
# PLAYBOOK 2 – PHISHING EMAIL TRIAGE
# (Inspired by Rapid7 Playbook p.4 + Splunk SOAR)
# ═══════════════════════════════════════════════
PHISHING_EMAILS = [
    {
        "id": "EMAIL-001", "subject": "Urgent: Reset Your Password Now",
        "sender": "security@paypa1.com", "sender_ip": "185.220.101.5",
        "recipient": "employee@corp.com",
        "indicators": ["malicious-link: http://paypa1.com/reset", "spoofed-domain"],
        "attachment": "reset_form.exe", "attachment_hash": "d41d8cd98f00b204e9800998ecf8427e",
        "url_scan": "MALICIOUS", "sandbox": "MALWARE_DETECTED",
        "priority_score": 95,
    },
    {
        "id": "EMAIL-002", "subject": "Invoice #8821 – Payment Required",
        "sender": "billing@invoice-portal.ru", "sender_ip": "198.51.100.77",
        "recipient": "finance@corp.com",
        "indicators": ["suspicious-domain", "macro-enabled-doc"],
        "attachment": "Invoice_8821.docm", "attachment_hash": "a3c2e7f1234abc789de",
        "url_scan": "SUSPICIOUS", "sandbox": "SUSPICIOUS_MACRO",
        "priority_score": 78,
    },
    {
        "id": "EMAIL-003", "subject": "HR Policy Update – Action Required",
        "sender": "hr-noreply@corp-update.com", "sender_ip": "54.36.149.105",
        "recipient": "all-staff@corp.com",
        "indicators": ["lookalike-domain", "phishing-kit-url"],
        "attachment": None, "attachment_hash": None,
        "url_scan": "SUSPICIOUS", "sandbox": "CLEAN",
        "priority_score": 62,
    },
    {
        "id": "EMAIL-004", "subject": "Q4 Budget Report",
        "sender": "cfo@corp.com", "sender_ip": "172.16.0.1",
        "recipient": "finance@corp.com",
        "indicators": [],
        "attachment": "Q4_Budget.xlsx", "attachment_hash": "none",
        "url_scan": "CLEAN", "sandbox": "CLEAN",
        "priority_score": 10,
    },
]

def playbook_phishing_triage():
    results = []
    for email in PHISHING_EMAILS:
        score = email["priority_score"]
        intel = enrich_ip(email["sender_ip"])

        if score >= 80:
            verdict = "MALICIOUS"; color = "danger"
            actions = [
                f"Email {email['id']} quarantined from all mailboxes",
                f"Sender domain {email['sender'].split('@')[1]} added to blocklist",
                f"Attachment hash submitted to sandbox: {email['attachment_hash'] or 'N/A'}",
                f"Sender IP {email['sender_ip']} blocked at mail gateway",
                f"End-user notified – phishing awareness alert sent",
                f"Incident ticket created: {incident_id('PHI')}",
            ]
        elif score >= 50:
            verdict = "SUSPICIOUS"; color = "warning"
            actions = [
                f"Email {email['id']} placed in quarantine for analyst review",
                f"URLs extracted and submitted to VirusTotal  [SIMULATED]",
                f"Sender IP {email['sender_ip']} added to watchlist",
                f"Analyst review assigned",
            ]
        else:
            verdict = "CLEAN"; color = "success"
            actions = [f"Email {email['id']} cleared – no action required", "Logged for audit trail"]

        iid = incident_id("PHI")
        results.append({
            "incident_id": iid,
            "email_id": email["id"], "subject": email["subject"],
            "sender": email["sender"], "sender_ip": email["sender_ip"],
            "recipient": email["recipient"],
            "indicators": email["indicators"],
            "attachment": email["attachment"],
            "url_scan": email["url_scan"], "sandbox": email["sandbox"],
            "priority_score": score, "reputation": intel["reputation"],
            "score": intel["score"],
            "verdict": verdict, "color": color,
            "actions": actions,
            "playbook": "Phishing_Triage_v2.1",
            "timestamp": now_str(),
        })
        if verdict != "CLEAN":
            save_incident({"id": iid, "type": "Phishing Email", "ip": email["sender_ip"],
                           "severity": "CRITICAL" if verdict == "MALICIOUS" else "MEDIUM",
                           "status": verdict, "ts": now_str()})

    return {
        "name": "Phishing Email Triage",
        "icon": "📧",
        "alerts": results,
        "stats": {
            "total":     len(results),
            "malicious": sum(1 for r in results if r["verdict"] == "MALICIOUS"),
            "suspicious":sum(1 for r in results if r["verdict"] == "SUSPICIOUS"),
            "clean":     sum(1 for r in results if r["verdict"] == "CLEAN"),
        }
    }

# ═══════════════════════════════════════════════
# PLAYBOOK 3 – MALWARE CONTAINMENT
# (Inspired by Rapid7 Playbook p.6)
# ═══════════════════════════════════════════════
MALWARE_ALERTS = [
    {
        "host": "WORKSTATION-042", "ip": "10.10.1.42", "user": "john.smith",
        "os": "Windows 11",
        "malware": "Emotet.Trojan", "family": "Emotet", "type": "Trojan",
        "hash": "3ab5c8da22f1e890a7b3c4d5e6f78901",
        "c2_ip": "185.220.101.5", "c2_port": 443,
        "detection_source": "EDR (CrowdStrike)", "confidence": 99,
    },
    {
        "host": "SERVER-DB-01", "ip": "10.10.2.15", "user": "svc_backup",
        "os": "Ubuntu 22.04",
        "malware": "Ransomware.LockBit", "family": "LockBit", "type": "Ransomware",
        "hash": "9f1a2b3c4d5e6f7890abcdef12345678",
        "c2_ip": "203.0.113.50", "c2_port": 8443,
        "detection_source": "AV (Defender)", "confidence": 87,
    },
    {
        "host": "LAPTOP-HR-07", "ip": "10.10.3.7", "user": "sarah.lee",
        "os": "macOS 14",
        "malware": "Adware.Generic", "family": "Generic Adware", "type": "Adware",
        "hash": "aabbccddeeff00112233445566778899",
        "c2_ip": None, "c2_port": None,
        "detection_source": "AV (Defender)", "confidence": 72,
    },
]

def playbook_malware_containment():
    results = []
    for alert in MALWARE_ALERTS:
        malware_type = alert["type"]
        c2 = alert["c2_ip"]

        if malware_type == "Ransomware":
            sev = "CRITICAL"; color = "danger"
            actions = [
                f"Host {alert['host']} isolated from network  [SIMULATED]",
                f"VLAN quarantine applied to {alert['ip']}",
                f"C2 IP {c2} blocked at perimeter firewall",
                f"Snapshot of filesystem taken before remediation",
                f"IR team notified – ransomware containment protocol initiated",
                f"Backup verification triggered",
                f"Incident ticket: {incident_id('MAL')}",
            ]
            action_label = "ISOLATED"
        elif malware_type == "Trojan":
            sev = "HIGH"; color = "danger"
            actions = [
                f"Host {alert['host']} network access restricted",
                f"C2 traffic to {c2}:{alert['c2_port']} blocked at firewall",
                f"Malware sample {alert['hash'][:16]}... submitted to sandbox",
                f"User {alert['user']} account suspended pending investigation",
                f"Full disk scan initiated on {alert['host']}",
                f"Incident ticket: {incident_id('MAL')}",
            ]
            action_label = "CONTAINED"
        else:
            sev = "LOW"; color = "info"
            actions = [
                f"Adware removed via EDR on {alert['host']}",
                f"User {alert['user']} notified with remediation steps",
                f"Logged for security awareness follow-up",
            ]
            action_label = "REMEDIATED"

        iid = incident_id("MAL")
        results.append({
            "incident_id": iid,
            **alert,
            "severity": sev, "color": color,
            "action_label": action_label,
            "actions": actions,
            "playbook": "Malware_Containment_v3.0",
            "timestamp": now_str(),
        })
        save_incident({"id": iid, "type": f"Malware ({alert['family']})",
                       "ip": alert["ip"], "severity": sev,
                       "status": action_label, "ts": now_str()})

    return {
        "name": "Malware Containment",
        "icon": "🦠",
        "alerts": results,
        "stats": {
            "total":     len(results),
            "critical":  sum(1 for r in results if r["severity"] == "CRITICAL"),
            "high":      sum(1 for r in results if r["severity"] == "HIGH"),
            "isolated":  sum(1 for r in results if r["action_label"] == "ISOLATED"),
        }
    }

# ═══════════════════════════════════════════════
# PLAYBOOK 4 – ALERT ENRICHMENT & THREAT INTEL
# (Inspired by Rapid7 p.7 + Splunk Intel Mgmt)
# ═══════════════════════════════════════════════
RAW_ALERTS = [
    {"id": "SIEM-4410", "type": "Port Scan",         "src_ip": "45.33.32.156",  "dst_port": "22,80,443,8080", "protocol": "TCP",  "count": 1250},
    {"id": "SIEM-4411", "type": "DNS Tunneling",     "src_ip": "10.0.0.47",     "dst_port": "53",             "protocol": "UDP",  "count": 840},
    {"id": "SIEM-4412", "type": "C2 Callback",       "src_ip": "192.168.1.105", "dst_port": "443",            "protocol": "HTTPS","count": 93},
    {"id": "SIEM-4413", "type": "Data Exfiltration", "src_ip": "172.16.0.88",   "dst_port": "21",             "protocol": "FTP",  "count": 4},
    {"id": "SIEM-4414", "type": "Suspicious Login",  "src_ip": "198.51.100.77", "dst_port": "3389",           "protocol": "RDP",  "count": 16},
]

def playbook_alert_enrichment():
    results = []
    for alert in RAW_ALERTS:
        intel = enrich_ip(alert["src_ip"])
        sev   = severity_from_score(intel["score"])
        rep   = intel["reputation"]

        enriched = {
            **alert,
            "reputation": rep,
            "score": intel["score"],
            "country": intel["country"],
            "asn": intel["asn"],
            "tags": intel["tags"],
            "isp": intel["isp"],
            "description": intel["description"],
            "source": intel["source"],
            "severity": sev,
            "color": "danger" if rep == "Malicious" else ("warning" if rep == "Suspicious" else "info"),
            "indicator_priority": "HIGH" if intel["score"] >= 80 else ("MEDIUM" if intel["score"] >= 50 else "LOW"),
            "playbook": "Alert_Enrichment_v2.0",
            "incident_id": incident_id("ENR"),
            "timestamp": now_str(),
        }
        results.append(enriched)

    return {
        "name": "Alert Enrichment & Threat Intel",
        "icon": "🔍",
        "alerts": results,
        "stats": {
            "total":     len(results),
            "malicious": sum(1 for r in results if r["reputation"] == "Malicious"),
            "suspicious":sum(1 for r in results if r["reputation"] == "Suspicious"),
            "high_priority": sum(1 for r in results if r["indicator_priority"] == "HIGH"),
        }
    }

# ═══════════════════════════════════════════════
# PLAYBOOK 5 – INSIDER THREAT DETECTION
# (Inspired by Logsign Buyer's Guide + UEBA)
# ═══════════════════════════════════════════════
INSIDER_EVENTS = [
    {
        "user": "mike.reynolds", "dept": "Finance",
        "events": [
            "Accessed 2,400 customer records outside business hours",
            "Downloaded 8 GB of sensitive files to USB device",
            "Attempted to access HR payroll system (denied)",
        ],
        "risk_score": 91, "anomalies": 3, "baseline_deviation": "HIGH",
        "account_status": "Active", "days_to_resignation": 14,
    },
    {
        "user": "emma.torres", "dept": "IT Operations",
        "events": [
            "Created new admin account without approval",
            "Disabled audit logging on 3 servers",
        ],
        "risk_score": 85, "anomalies": 2, "baseline_deviation": "HIGH",
        "account_status": "Active", "days_to_resignation": None,
    },
    {
        "user": "raj.patel", "dept": "Engineering",
        "events": [
            "Logged in from 2 countries within 4 hours (Impossible Travel)",
            "Accessed source code repository at 03:15 AM",
        ],
        "risk_score": 72, "anomalies": 2, "baseline_deviation": "MEDIUM",
        "account_status": "Active", "days_to_resignation": None,
    },
    {
        "user": "lisa.ng", "dept": "Marketing",
        "events": [
            "Multiple failed access attempts to restricted folders",
        ],
        "risk_score": 38, "anomalies": 1, "baseline_deviation": "LOW",
        "account_status": "Active", "days_to_resignation": None,
    },
]

def playbook_insider_threat():
    results = []
    for insider in INSIDER_EVENTS:
        score = insider["risk_score"]
        sev   = severity_from_score(score)

        if score >= 85:
            color = "danger"
            actions = [
                f"Account {insider['user']} suspended pending investigation",
                f"Manager and HR notified immediately",
                f"All active sessions for {insider['user']} terminated",
                f"Forensic image of workstation initiated",
                f"Legal hold placed on email/file activity",
                f"Incident ticket: {incident_id('INS')}",
            ]
            verdict = "SUSPENDED"
        elif score >= 60:
            color = "warning"
            actions = [
                f"Enhanced monitoring enabled for {insider['user']}",
                f"Access to sensitive systems restricted",
                f"Manager briefed – confidential investigation opened",
                f"UEBA alert escalated to Tier 2",
            ]
            verdict = "UNDER REVIEW"
        else:
            color = "info"
            actions = [
                f"Alert logged for {insider['user']} – no immediate action",
                f"Behavior baseline updated",
            ]
            verdict = "MONITORING"

        iid = incident_id("INS")
        results.append({
            "incident_id": iid,
            **insider,
            "severity": sev,
            "color": color,
            "verdict": verdict,
            "actions": actions,
            "playbook": "Insider_Threat_Response_v1.5",
            "timestamp": now_str(),
        })
        if verdict != "MONITORING":
            save_incident({"id": iid, "type": "Insider Threat",
                           "ip": f"user:{insider['user']}", "severity": sev,
                           "status": verdict, "ts": now_str()})

    return {
        "name": "Insider Threat Detection",
        "icon": "👤",
        "alerts": results,
        "stats": {
            "total":     len(results),
            "high_risk": sum(1 for r in results if r["risk_score"] >= 80),
            "suspended": sum(1 for r in results if r["verdict"] == "SUSPENDED"),
        }
    }

# ═══════════════════════════════════════════════
# PLAYBOOK 6 – VULNERABILITY MANAGEMENT
# (Inspired by Rapid7 Playbook p.10 + Swimlane)
# ═══════════════════════════════════════════════
VULN_ASSETS = [
    {"asset": "web-server-01",  "ip": "10.0.1.10", "os": "Ubuntu 20.04", "cves": ["CVE-2024-1234", "CVE-2024-2233"]},
    {"asset": "db-server-01",   "ip": "10.0.1.20", "os": "CentOS 7",     "cves": ["CVE-2023-9101", "CVE-2024-5678"]},
    {"asset": "app-server-01",  "ip": "10.0.1.30", "os": "Windows 2019", "cves": ["CVE-2023-4455"]},
    {"asset": "dev-laptop-05",  "ip": "10.0.2.15", "os": "macOS 14",     "cves": []},
]

def playbook_vuln_management():
    cve_map = {c["cve"]: c for c in CVE_DATABASE}
    results = []
    for asset in VULN_ASSETS:
        cves = [cve_map[c] for c in asset["cves"] if c in cve_map]
        max_score = max((c["score"] for c in cves), default=0)
        sev = severity_from_score(max_score * 10) if cves else "NONE"

        if sev == "CRITICAL":
            color = "danger"
            actions = [
                f"Emergency patch scheduled for {asset['asset']} – 4hr SLA",
                f"Asset isolated from production network during patching",
                f"CISO and infra team alerted",
                f"Patch compliance ticket created: {incident_id('VUL')}",
            ]
            verdict = "EMERGENCY PATCH"
        elif sev == "HIGH":
            color = "warning"
            actions = [
                f"Patch scheduled for {asset['asset']} – 24hr SLA",
                f"Temporary WAF rule applied as mitigation",
                f"Patch compliance ticket: {incident_id('VUL')}",
            ]
            verdict = "PATCH SCHEDULED"
        elif sev == "MEDIUM":
            color = "info"
            actions = [
                f"Patch queued for {asset['asset']} – next maintenance window",
                f"Vulnerability logged in patch management system",
            ]
            verdict = "QUEUED"
        else:
            color = "success"
            actions = [f"{asset['asset']} – no vulnerabilities detected", "Verified clean – no action needed"]
            verdict = "CLEAN"

        iid = incident_id("VUL")
        results.append({
            "incident_id": iid,
            **asset,
            "cves_found": cves,
            "max_cvss": max_score,
            "severity": sev,
            "color": color,
            "verdict": verdict,
            "actions": actions,
            "playbook": "Vuln_Management_v4.0",
            "timestamp": now_str(),
        })

    return {
        "name": "Vulnerability Management",
        "icon": "🛡️",
        "alerts": results,
        "stats": {
            "total":         len(results),
            "critical_assets": sum(1 for r in results if r["severity"] == "CRITICAL"),
            "patches_needed":  sum(1 for r in results if r["verdict"] != "CLEAN"),
            "total_cves":      sum(len(r["cves_found"]) for r in results),
        }
    }

# ═══════════════════════════════════════════════
# AGGREGATE DASHBOARD STATS
# ═══════════════════════════════════════════════
def get_all_playbook_data():
    pb1 = playbook_ssh_brute_force()
    pb2 = playbook_phishing_triage()
    pb3 = playbook_malware_containment()
    pb4 = playbook_alert_enrichment()
    pb5 = playbook_insider_threat()
    pb6 = playbook_vuln_management()
    playbooks = [pb1, pb2, pb3, pb4, pb5, pb6]

    total_alerts    = sum(p["stats"]["total"] for p in playbooks)
    total_incidents = sum(
        p["stats"].get("critical", 0) + p["stats"].get("high", 0) +
        p["stats"].get("malicious", 0) + p["stats"].get("high_risk", 0) +
        p["stats"].get("critical_assets", 0)
        for p in playbooks
    )
    total_contained = sum(
        p["stats"].get("blocked", 0) + p["stats"].get("malicious", 0) +
        p["stats"].get("isolated", 0) + p["stats"].get("suspended", 0) +
        p["stats"].get("critical_assets", 0)
        for p in playbooks
    )

    # Recent incidents timeline (from incident log)
    timeline = []
    if os.path.exists(INCIDENT_LOG):
        try:
            with open(INCIDENT_LOG) as f:
                incidents = json.load(f)
            timeline = incidents[-12:][::-1]  # last 12, newest first
        except Exception:
            pass

    return {
        "playbooks": playbooks,
        "global_stats": {
            "total_alerts":    total_alerts,
            "total_incidents": total_incidents,
            "total_contained": total_contained,
            "playbooks_run":   len(playbooks),
            "scan_time":       now_str(),
        },
        "timeline": timeline,
    }

# ═══════════════════════════════════════════════
# FLASK ROUTES
# ═══════════════════════════════════════════════
@app.route("/")
def dashboard():
    # Reset incidents log on each full page load for clean demo state
    if os.path.exists(INCIDENT_LOG):
        os.remove(INCIDENT_LOG)
    data = get_all_playbook_data()
    return render_template("index.html", data=data)

@app.route("/api/data")
def api_data():
    return jsonify(get_all_playbook_data())

@app.route("/api/run_playbook/<int:pb_id>")
def run_single_playbook(pb_id):
    runners = [
        playbook_ssh_brute_force,
        playbook_phishing_triage,
        playbook_malware_containment,
        playbook_alert_enrichment,
        playbook_insider_threat,
        playbook_vuln_management,
    ]
    if 1 <= pb_id <= len(runners):
        return jsonify(runners[pb_id - 1]())
    return jsonify({"error": "Invalid playbook ID"}), 404

@app.route("/api/ingest_logs", methods=["POST"])
def ingest_logs():
    """Receive log lines from System B and append to auth.log."""
    payload = request.get_json(force=True, silent=True) or {}
    lines = payload.get("lines", [])
    if not lines:
        return jsonify({"error": "No lines provided"}), 400
    with open(AUTH_LOG, "a") as f:
        for line in lines:
            f.write(line.rstrip("\n") + "\n")
    return jsonify({"status": "ok", "ingested": len(lines)})

@app.route("/api/stats")
def api_stats():
    data = get_all_playbook_data()
    return jsonify(data["global_stats"])

# ═══════════════════════════════════════════════
# ORCHESEC AI AGENT – TOOL-BASED AGENT ENGINE
# ═══════════════════════════════════════════════

def ai_tool_alert_analyzer():
    """Tool 1 – Read and summarize current SOAR alerts."""
    pb1 = playbook_ssh_brute_force()
    pb2 = playbook_phishing_triage()
    pb3 = playbook_malware_containment()
    pb4 = playbook_alert_enrichment()
    pb5 = playbook_insider_threat()
    pb6 = playbook_vuln_management()

    all_pbs = [pb1, pb2, pb3, pb4, pb5, pb6]
    total = sum(p["stats"]["total"] for p in all_pbs)

    critical_alerts = []
    high_alerts = []
    for pb in all_pbs:
        for alert in pb["alerts"]:
            sev = alert.get("severity", alert.get("verdict", "LOW"))
            if sev in ("CRITICAL", "MALICIOUS"):
                critical_alerts.append((pb["icon"], pb["name"], alert))
            elif sev in ("HIGH", "SUSPICIOUS"):
                high_alerts.append((pb["icon"], pb["name"], alert))

    lines = [f"🔍 **Alert Analyzer Report** — {now_str()}\n",
             f"📊 Total alerts across all playbooks: **{total}**\n"]

    if critical_alerts:
        lines.append(f"\n🚨 **CRITICAL / MALICIOUS** ({len(critical_alerts)} alerts):")
        for icon, name, a in critical_alerts[:5]:
            ip = a.get("ip") or a.get("sender_ip") or a.get("host") or a.get("user") or a.get("asset", "—")
            lines.append(f"  {icon} [{name}] Source: `{ip}` | Severity: CRITICAL")
    if high_alerts:
        lines.append(f"\n⚠️ **HIGH / SUSPICIOUS** ({len(high_alerts)} alerts):")
        for icon, name, a in high_alerts[:5]:
            ip = a.get("ip") or a.get("sender_ip") or a.get("host") or a.get("user") or a.get("asset", "—")
            lines.append(f"  {icon} [{name}] Source: `{ip}` | Severity: HIGH")

    lines.append(f"\n✅ Playbooks active: {len(all_pbs)} | Last scan: {now_str()}")
    return "\n".join(lines)


def ai_tool_threat_intel(ip=None):
    """Tool 2 – Check IP reputation from threat intelligence database."""
    if not ip:
        # Return overview of all known malicious IPs
        malicious = [(k, v) for k, v in THREAT_INTEL.items() if v["reputation"] == "Malicious"]
        suspicious = [(k, v) for k, v in THREAT_INTEL.items() if v["reputation"] == "Suspicious"]
        lines = ["🧠 **Threat Intelligence Overview**\n",
                 f"🔴 Malicious IPs in database: {len(malicious)}",
                 f"🟡 Suspicious IPs in database: {len(suspicious)}\n",
                 "**Top Malicious Actors:**"]
        for k, v in malicious[:3]:
            lines.append(f"  • `{k}` — Score: {v['score']}/100 | Tags: {', '.join(v['tags'])} | Source: {v['source']}")
        return "\n".join(lines)

    intel = THREAT_INTEL.get(ip)
    if not intel:
        return (f"🔍 **Threat Intel Lookup: `{ip}`**\n\n"
                f"ℹ️ No threat intelligence data found for `{ip}`.\n"
                f"Status: **Unknown** | Recommendation: Monitor this IP for suspicious activity.")

    rep = intel["reputation"]
    icon = "🔴" if rep == "Malicious" else ("🟡" if rep == "Suspicious" else "🟢")
    lines = [
        f"🧠 **Threat Intel Lookup: `{ip}`**\n",
        f"{icon} Reputation: **{rep}** | Confidence Score: **{intel['score']}/100**",
        f"🌍 Country: {intel['country']} | ISP: {intel['isp']} | ASN: {intel['asn']}",
        f"🏷️ Tags: {', '.join(intel['tags'])}",
        f"📋 Description: {intel['description']}",
        f"📡 Source: {intel['source']}\n",
    ]
    if rep == "Malicious":
        lines.append("🚨 **Recommended Action: BLOCK this IP immediately.**")
        lines.append(f"  → Execute: `iptables -A INPUT -s {ip} -j DROP`")
    elif rep == "Suspicious":
        lines.append("⚠️ **Recommended Action: Monitor and rate-limit this IP.**")
    return "\n".join(lines)


def ai_tool_response_executor(action, ip=None, host=None):
    """Tool 3 – Execute response playbook actions."""
    ts = now_str()
    if action == "block_ip":
        target = ip or "unknown"
        return (f"⚡ **Response Executor — block_ip**\n\n"
                f"🔒 Executing firewall block for `{target}`...\n\n"
                f"```\niptables -A INPUT -s {target} -j DROP  [SIMULATED]\niptables -A OUTPUT -d {target} -j DROP  [SIMULATED]\n```\n\n"
                f"✅ IP `{target}` successfully blocked on all ports.\n"
                f"📋 Firewall rule ID: FW-{random.randint(10000,99999)} | Timestamp: {ts}\n"
                f"📧 SOC team notified via PagerDuty  [SIMULATED]\n"
                f"📝 Incident logged: {incident_id('INC')}")
    elif action == "isolate_host":
        target = host or ip or "unknown"
        return (f"⚡ **Response Executor — isolate_host**\n\n"
                f"🔌 Isolating host `{target}` from network...\n\n"
                f"```\nnet-isolate --host {target} --vlan quarantine  [SIMULATED]\n```\n\n"
                f"✅ Host `{target}` isolated. Network access revoked.\n"
                f"📋 VLAN quarantine applied | Timestamp: {ts}\n"
                f"📝 Incident logged: {incident_id('MAL')}")
    elif action == "notify_admin":
        return (f"⚡ **Response Executor — notify_admin**\n\n"
                f"📧 Sending critical alert to SOC administrators...\n\n"
                f"✅ Email dispatched to: soc-team@company.com  [SIMULATED]\n"
                f"✅ PagerDuty alert triggered — Severity P1\n"
                f"✅ Slack #soc-alerts channel notified\n"
                f"📋 Timestamp: {ts}")
    elif action == "log_incident":
        iid = incident_id("AGT")
        return (f"⚡ **Response Executor — log_incident**\n\n"
                f"📝 Creating incident record in SOAR database...\n\n"
                f"✅ Incident ID: **{iid}** logged successfully.\n"
                f"📋 Timestamp: {ts} | Status: OPEN | Assigned to: SOC Tier 2")
    else:
        return f"❌ Unknown action: `{action}`. Available: block_ip, isolate_host, notify_admin, log_incident"


def ai_tool_log_query(ip=None):
    """Tool 4 – Search authentication logs for an IP."""
    if not os.path.exists(AUTH_LOG):
        return "📋 **Log Query Tool**\n\nNo authentication logs available. Run the SSH Brute-Force playbook first."

    results = []
    target_ip = ip or ""
    with open(AUTH_LOG) as f:
        for i, line in enumerate(f):
            if not target_ip or target_ip in line:
                results.append(line.strip())
            if len(results) >= 10:
                break

    if not results:
        return f"📋 **Log Query Tool** — IP: `{target_ip}`\n\nNo log entries found for this IP address."

    lines = [f"📋 **Log Query Tool** — IP: `{target_ip or 'ALL'}`\n",
             f"Found {len(results)} matching log entries (showing up to 10):\n",
             "```"]
    lines.extend(results[:10])
    lines.append("```")
    return "\n".join(lines)


def ai_tool_incident_summary():
    """Generate automatic incident summary card."""
    pb1 = playbook_ssh_brute_force()
    # Get the most critical alert from brute force
    if pb1["alerts"]:
        top = sorted(pb1["alerts"], key=lambda x: -x.get("failed_attempts", 0))[0]
        return (f"🔐 **Security Incident Summary**\n\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"**Attack Type:** SSH Brute Force\n"
                f"**Source IP:** `{top['ip']}`\n"
                f"**Failed Attempts:** {top['failed_attempts']}\n"
                f"**Risk Level:** {top['severity']}\n"
                f"**IP Reputation:** {top['reputation']} ({top['score']}/100)\n"
                f"**Country:** {top['country']} | ISP: {top['isp']}\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"**Recommended Action:**\n"
                f"  1. Block attacker IP immediately\n"
                f"  2. Review authentication logs\n"
                f"  3. Monitor for additional attempts\n"
                f"  4. Notify SOC team")
    return "✅ No critical incidents detected at this time."


def ai_tool_prioritize_alerts():
    """Tool – Prioritize and rank all alerts by severity."""
    pb1 = playbook_ssh_brute_force()
    pb2 = playbook_phishing_triage()
    pb3 = playbook_malware_containment()

    ranked = []
    for a in pb1["alerts"]:
        ranked.append({"priority": a.get("score", 0), "type": "SSH Brute Force",
                       "target": a.get("ip","?"), "severity": a.get("severity","?"),
                       "action": f"Block IP {a.get('ip','?')}"})
    for a in pb2["alerts"]:
        ranked.append({"priority": a.get("priority_score", 0), "type": "Phishing Email",
                       "target": a.get("sender","?"), "severity": a.get("verdict","?"),
                       "action": f"Quarantine email {a.get('email_id','?')}"})
    for a in pb3["alerts"]:
        score_map = {"CRITICAL": 95, "HIGH": 80, "LOW": 30}
        ranked.append({"priority": score_map.get(a.get("severity","LOW"), 30), "type": f"Malware ({a.get('family','?')})",
                       "target": a.get("host","?"), "severity": a.get("severity","?"),
                       "action": f"Isolate host {a.get('host','?')}"})

    ranked.sort(key=lambda x: -x["priority"])
    lines = ["🎯 **Alert Priority Ranking** (Highest Risk First)\n"]
    for i, item in enumerate(ranked[:6], 1):
        icon = "🔴" if item["severity"] in ("CRITICAL","MALICIOUS") else ("🟡" if item["severity"] in ("HIGH","SUSPICIOUS") else "🟢")
        lines.append(f"**#{i}** {icon} [{item['type']}] Target: `{item['target']}`")
        lines.append(f"     Severity: {item['severity']} | Priority Score: {item['priority']}")
        lines.append(f"     → Recommended: {item['action']}\n")
    return "\n".join(lines)


def orchesec_agent(query: str) -> str:
    """Main OrcheSec AI Agent – parses query and routes to appropriate tool(s)."""
    q = query.lower().strip()

    # Greetings
    if any(w in q for w in ["hello", "hi", "hey", "help", "what can you do"]):
        return ("👋 **Hello! I'm OrcheSec AI Agent.**\n\n"
                "I'm your intelligent SOC assistant embedded in the SOAR platform. I can help you with:\n\n"
                "🔍 **Alert Analysis** — Summarize all active security alerts\n"
                "🧠 **Threat Intelligence** — Look up IP reputation and threat data\n"
                "⚡ **Response Actions** — Execute playbooks (block IP, isolate host, notify admin)\n"
                "📋 **Log Queries** — Search authentication logs for suspicious IPs\n"
                "🎯 **Alert Prioritization** — Rank alerts by risk severity\n"
                "📝 **Incident Summaries** — Auto-generate incident summary reports\n\n"
                "Try: _\"Show me the latest alerts\"_ or _\"Check IP 192.168.1.105\"_")

    # Incident summary
    if any(w in q for w in ["summary", "incident summary", "summarize", "what happened", "overview"]):
        return ai_tool_incident_summary()

    # Prioritize / rank alerts
    if any(w in q for w in ["prioritize", "priority", "rank", "most critical", "highest risk", "most dangerous"]):
        return ai_tool_prioritize_alerts()

    # Show all alerts / latest alerts
    if any(w in q for w in ["latest alert", "show alert", "all alert", "list alert", "current alert",
                              "what alert", "detect", "show me"]):
        return ai_tool_alert_analyzer()

    # Threat intelligence – check a specific IP
    import re as _re
    ip_match = _re.search(r"\b(\d{1,3}(?:\.\d{1,3}){3})\b", query)
    if ip_match and any(w in q for w in ["check", "lookup", "intel", "reputation", "threat", "malicious", "scan", "info"]):
        return ai_tool_threat_intel(ip_match.group(1))

    # Block IP
    if any(w in q for w in ["block", "ban", "drop"]) and ip_match:
        ip = ip_match.group(1)
        return ai_tool_response_executor("block_ip", ip=ip)
    if any(w in q for w in ["block ip", "block attacker", "block this"]):
        # Try to extract IP from context, or use most dangerous one
        pb1 = playbook_ssh_brute_force()
        top_ip = pb1["alerts"][0]["ip"] if pb1["alerts"] else "192.168.1.105"
        return ai_tool_response_executor("block_ip", ip=top_ip)

    # Isolate host
    if any(w in q for w in ["isolate", "quarantine host", "contain host"]):
        host_match = _re.search(r"\b([A-Z][\w-]{3,20})\b", query)
        host = host_match.group(1) if host_match else "WORKSTATION-042"
        return ai_tool_response_executor("isolate_host", host=host)

    # Notify admin
    if any(w in q for w in ["notify", "alert admin", "contact soc", "page", "escalate"]):
        return ai_tool_response_executor("notify_admin")

    # Log incident
    if any(w in q for w in ["log incident", "create ticket", "create incident", "open ticket"]):
        return ai_tool_response_executor("log_incident")

    # Log search
    if any(w in q for w in ["log", "auth log", "authentication", "search log", "show log"]):
        if ip_match:
            return ai_tool_log_query(ip=ip_match.group(1))
        return ai_tool_log_query()

    # Threat intel without specifying action
    if ip_match:
        return ai_tool_threat_intel(ip_match.group(1))

    # Threat intel overview
    if any(w in q for w in ["threat intel", "threat intelligence", "malicious ip", "known attacker"]):
        return ai_tool_threat_intel()

    # Playbook questions
    if any(w in q for w in ["playbook", "run playbook", "execute", "response plan"]):
        return ("📋 **Available Playbooks:**\n\n"
                "1. 🔐 **SSH Brute-Force Response** — Detects brute-force attacks and blocks attackers\n"
                "2. 📧 **Phishing Email Triage** — Quarantines phishing emails and blocks sender domains\n"
                "3. 🦠 **Malware Containment** — Isolates infected hosts and blocks C2 servers\n"
                "4. 🔍 **Alert Enrichment** — Enriches SIEM alerts with threat intelligence\n"
                "5. 👤 **Insider Threat Detection** — Suspends high-risk user accounts\n"
                "6. 🛡️ **Vulnerability Management** — Schedules emergency patches for critical CVEs\n\n"
                "💬 Say _\"Run SSH Brute-Force playbook\"_ or click **Playbooks** in the sidebar to execute.")

    # What should I do / recommendation
    if any(w in q for w in ["what should", "recommend", "suggest", "what to do", "next step", "how to"]):
        pb1 = playbook_ssh_brute_force()
        top = pb1["alerts"][0] if pb1["alerts"] else None
        if top:
            return (f"🛡️ **Recommended Response Actions**\n\n"
                    f"Based on the current threat landscape, here are my top recommendations:\n\n"
                    f"**Priority 1 — Block Attacker (Immediate)**\n"
                    f"  → Block `{top['ip']}` — {top['failed_attempts']} failed SSH attempts detected\n"
                    f"  → Execute: `iptables -A INPUT -s {top['ip']} -j DROP`\n\n"
                    f"**Priority 2 — Review Authentication Logs**\n"
                    f"  → Search logs for `{top['ip']}` and related IPs\n"
                    f"  → Check for successful logins around attack window\n\n"
                    f"**Priority 3 — Monitor for Lateral Movement**\n"
                    f"  → Enable enhanced logging on all SSH endpoints\n"
                    f"  → Watch internal IPs for lateral movement indicators\n\n"
                    f"**Priority 4 — Notify SOC Team**\n"
                    f"  → Escalate to Tier 2 analyst for investigation\n"
                    f"  → Create incident ticket for audit trail\n\n"
                    f"💬 Say _\"Block {top['ip']}\"_ to execute the firewall block automatically.")
        return "✅ No critical threats detected. All systems appear normal."

    # Fallback
    return (f"🤖 **OrcheSec AI Agent**\n\n"
            f"I received your query: _\"{query}\"_\n\n"
            f"I wasn't able to match a specific tool for that request. Try:\n"
            f"• _\"Show me the latest alerts\"_\n"
            f"• _\"Check IP 192.168.1.105\"_\n"
            f"• _\"Block 192.168.1.20\"_\n"
            f"• _\"Show auth logs\"_\n"
            f"• _\"Prioritize alerts\"_\n"
            f"• _\"What should I do about this attack?\"_")


@app.route("/api/ai_agent", methods=["POST"])
def api_ai_agent():
    """OrcheSec AI Agent endpoint."""
    payload = request.get_json(force=True, silent=True) or {}
    query = payload.get("query", "").strip()
    if not query:
        return jsonify({"error": "No query provided"}), 400
    response = orchesec_agent(query)
    return jsonify({"response": response, "timestamp": now_str(), "agent": "OrcheSec AI Agent"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

