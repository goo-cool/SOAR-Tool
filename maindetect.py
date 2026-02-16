import re
from collections import defaultdict

LOG_FILE = "auth.log"
THRESHOLD = 3  # min failures before flagging IP

def detect_suspicious_ips(log_file):
    ip_failures = defaultdict(int)

    with open(log_file, "r") as f:
        for line in f:
            if "Failed password" in line:
                match = re.search(r"from (\d+\.\d+\.\d+\.\d+)", line)
                if match:
                    ip = match.group(1)
                    ip_failures[ip] += 1

    # Collect suspicious IPs
    suspicious_ips = [(ip, count) for ip, count in ip_failures.items() if count >= THRESHOLD]
    return suspicious_ips, ip_failures

if __name__ == "__main__":
    alerts, all_counts = detect_suspicious_ips(LOG_FILE)

    print("\n=== LOGIN ATTEMPT SUMMARY ===")
    for ip, count in all_counts.items():
        print(f"{ip} → {count} failed attempts")

    print("\n=== SUSPICIOUS ACTIVITY DETECTED ===")
    if alerts:
        for ip, count in alerts:
            print(f"🚨 ALERT: {ip} failed {count} times (Threshold = {THRESHOLD})")
    else:
        print("✅ No suspicious IPs found.")
