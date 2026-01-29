from flask import Flask, request, jsonify
from flask_cors import CORS
import os, random, datetime

app = Flask(__name__)
CORS(app)

# ---------------- SIMULATION DATA ----------------
SIMULATED_AGENTS = [
    {"hostname": "FINANCE-PC", "ip": "192.168.1.10", "os": "Windows 10"},
    {"hostname": "HR-LINUX", "ip": "192.168.1.11", "os": "Ubuntu 22.04"},
    {"hostname": "DEV-SERVER", "ip": "192.168.1.12", "os": "RHEL 9"},
    {"hostname": "ADMIN-PC", "ip": "192.168.1.13", "os": "Windows 11"},
    {"hostname": "SECURITY-NODE", "ip": "192.168.1.14", "os": "Debian 12"},
]

# CIS-Language Vulnerability Library
VULNERABILITY_LIBRARY = [
    {"desc": "Ensure HTTP Strict Transport Security (HSTS) is enabled", "cat": "L1 - Web Server Hardening"},
    {"desc": "Ensure 'Account lockout duration' is set to 15 minutes or greater", "cat": "L1 - Password Policy"},
    {"desc": "Ensure 'SSH Root Login' is set to 'no'", "cat": "L1 - SSH Server Configuration"},
    {"desc": "Ensure 'AppLocker' is configured to 'Enforce rules'", "cat": "L2 - Application Whitelisting"},
    {"desc": "Ensure unencrypted SMB communication is disabled", "cat": "L1 - Network Security"},
    {"desc": "Ensure 'Windows Firewall: Domain: Firewall state' is set to 'On'", "cat": "L1 - Connectivity"},
]

# Initialize global stable state for the session
STABLE_VULNS = []
def init_simulation():
    global STABLE_VULNS
    STABLE_VULNS = []
    vid = 101
    for agent in SIMULATED_AGENTS:
        # Assign 2-4 consistent issues per device
        for _ in range(random.randint(2, 4)):
            item = random.choice(VULNERABILITY_LIBRARY)
            STABLE_VULNS.append({
                "id": f"CIS-{vid}",
                "severity": random.choice(["High", "Medium", "Low"]),
                "category": item["cat"],
                "description": item["desc"],
                "system": agent["hostname"],
                "status": "Open",
                "detected": datetime.datetime.now().strftime("%Y-%m-%d")
            })
            vid += 1

init_simulation()

# ---------------- ROUTES ----------------
@app.route("/api/dashboard/overview", methods=["GET"])
def get_dashboard_overview():
    total_agents = len(SIMULATED_AGENTS)
    total_issues = len(STABLE_VULNS)
    
    # Calculate CIS Compliance Score
    # Deduct 5% for High, 2% for Med, 1% for Low per agent
    deductions = sum([5 if v['severity'] == "High" else 2 for v in STABLE_VULNS])
    score = max(0, 100 - (deductions // total_agents))

    return jsonify({
        "securityScore": score,
        "totalAgents": total_agents,
        "totalIssues": total_issues,
        "posture": "Compliant" if score > 85 else "Non-Compliant",
        "nodes": SIMULATED_AGENTS
    })

@app.route("/api/vulnerabilities", methods=["GET"])
def get_vulnerabilities():
    return jsonify(STABLE_VULNS)

@app.route("/api/compliance", methods=["GET"])
def compliance_report():
    return jsonify([
        {"system": a["hostname"], "benchmark": f"CIS {a['os']}", "status": "Fail", "score": random.randint(60, 85)}
        for a in SIMULATED_AGENTS
    ])

@app.route("/api/remediation", methods=["GET"])
def get_remediation():
    return jsonify({
        "remediationTools": [
            {"id": 1, "issue": "SSH Root Login Enabled", "risk": "High", "recommendedAction": "Modify /etc/ssh/sshd_config: PermitRootLogin no", "system": "HR-LINUX"},
            {"id": 2, "issue": "Weak Password Policy", "risk": "Medium", "recommendedAction": "Apply GPO: Minimum password length 14", "system": "FINANCE-PC"}
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)