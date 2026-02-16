import random
import datetime

# Output log file
LOG_FILE = "auth.log"

# Sample IP pool
ips = ["192.168.1.10", "192.168.1.20", "192.168.1.30",
       "192.168.1.40", "192.168.1.50", "192.168.1.60"]

# Users
users = ["root", "admin", "test", "ubuntu"]

# Generate timestamp within a day
def random_time():
    today = datetime.date.today()
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    timestamp = datetime.datetime(today.year, today.month, today.day,
                                  hour, minute, second)
    return timestamp.strftime("%b %d %H:%M:%S")

# Write logs
with open(LOG_FILE, "w") as f:
    for i in range(60):  # 60 log entries
        ts = random_time()
        ip = random.choice(ips)
        user = random.choice(users)
        pid = random.randint(1000, 5000)
        port = random.randint(4000, 6000)

        # 70% chance failed login, 30% success
        if random.random() < 0.7:
            log = f"{ts} laptopB sshd[{pid}]: Failed password for {user} from {ip} port {port} ssh2\n"
        else:
            log = f"{ts} laptopB sshd[{pid}]: Accepted password for {user} from {ip} port {port} ssh2\n"

        f.write(log)

print(f"✅ Generated {LOG_FILE} with 60 entries.")
