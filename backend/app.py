from flask import Flask, request, jsonify
from flask_cors import CORS
import os, random, datetime
# from database_models import System, ScanResult
# from sqlalchemy.orm import Session
from database import SessionLocal
from database_models import Agent, ScanResult
# from database_init import SessionLocal
import secrets

app = Flask(__name__)
CORS(app)

from database_init import init_db
init_db()

# ------------------ AGENT REGISTER ------------------

@app.route("/api/agents/register", methods=["POST"])
def register_agent():
    data = request.json
    db = SessionLocal()

    try:
        system_name = data["system_name"]
        os_name = data["os_name"]
        ip_address = data["ip_address"]

        existing = db.query(Agent).filter(Agent.name == system_name).first()
        if existing:
            if not existing.agent_token:
                existing.agent_token = secrets.token_hex(16)
                db.commit()

            return jsonify({"agent_token": existing.agent_token})



        token = secrets.token_hex(16)

        agent = Agent(
            name=system_name,
            os_name=os_name,
            ip_address=ip_address,
            role=data.get("role", "AGENT"),
            agent_token=token
        )

        db.add(agent)
        db.commit()

        return jsonify({
            "agent_token": token
        })

    except Exception as e:
        print("REGISTER AGENT ERROR:", e)
        return jsonify({"error": "registration failed"}), 500

    finally:
        db.close()

# CIS-Language Vulnerability Library
# VULNERABILITY_LIBRARY = [
#     {"desc": "Ensure HTTP Strict Transport Security (HSTS) is enabled", "cat": "L1 - Web Server Hardening"},
#     {"desc": "Ensure 'Account lockout duration' is set to 15 minutes or greater", "cat": "L1 - Password Policy"},
#     {"desc": "Ensure 'SSH Root Login' is set to 'no'", "cat": "L1 - SSH Server Configuration"},
#     {"desc": "Ensure 'AppLocker' is configured to 'Enforce rules'", "cat": "L2 - Application Whitelisting"},
#     {"desc": "Ensure unencrypted SMB communication is disabled", "cat": "L1 - Network Security"},
#     {"desc": "Ensure 'Windows Firewall: Domain: Firewall state' is set to 'On'", "cat": "L1 - Connectivity"},
# ]

# ---------------- ROUTES ----------------
@app.route("/api/dashboard/overview", methods=["GET"])
def get_dashboard_overview():
    system_name = request.headers.get("X-System") or request.args.get("system")

    if not system_name or not is_admin(system_name):
        return jsonify({"error": "Unauthorized"}), 403

    db = SessionLocal()

    agents = db.query(Agent).all()
    scans = db.query(ScanResult).all()

    total_agents = len(agents)
    total_issues = sum(s.failed_count for s in scans)

    avg_score = (
        sum(s.score_percent for s in scans) / len(scans)
        if scans else 100
    )

    db.close()

    return jsonify({
        "securityScore": round(avg_score, 2),
        "totalAgents": total_agents,
        "totalIssues": total_issues
    })
    
# ------------------ VULNERBILITIES ------------------

@app.route("/api/vulnerabilities", methods=["GET"])
def get_vulnerabilities():
    system_name = request.headers.get("X-System")
    db = SessionLocal()

    agent = db.query(Agent).filter(Agent.name == system_name).first()
    if not agent:
        return jsonify([])

    scans = db.query(ScanResult).filter(
        ScanResult.agent_id == agent.id
    ).all()

    vulns = []
    for s in scans:
        if s.failed_count > 0:
            vulns.append({
                "system": agent.name,
                "severity": "High" if s.failed_count > 3 else "Medium",
                "description": f"{s.failed_count} CIS checks failed",
                "status": "Open"
            })

    db.close()
    return jsonify(vulns)

def is_admin(system_name):
    db = SessionLocal()
    agent = db.query(Agent).filter(Agent.name == system_name).first()
    db.close()
    return agent and agent.role == "ADMIN"


@app.route("/api/compliance", methods=["GET"])
def compliance_report():
    db = SessionLocal()

    scans = db.query(ScanResult).all()
    report = []

    for s in scans:
        report.append({
            "system": s.agent.system_name,
            "benchmark": f"CIS {s.benchmark_name}",
            "status": "Fail" if s.failed_count > 0 else "Pass",
            "score": s.score_percent
        })

    db.close()
    return jsonify(report)


@app.route("/api/remediation", methods=["GET"])
def get_remediation():
    return jsonify({
        "remediationTools": [
            {"id": 1, "issue": "SSH Root Login Enabled", "risk": "High", "recommendedAction": "Modify /etc/ssh/sshd_config: PermitRootLogin no", "system": "HR-LINUX"},
            {"id": 2, "issue": "Weak Password Policy", "risk": "Medium", "recommendedAction": "Apply GPO: Minimum password length 14", "system": "FINANCE-PC"}
        ]
    })
    
# ------------------------------- UPLOAD SCAN -------------------------------
    
@app.route("/api/upload", methods=["POST"])
def upload_scan():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    data = request.json

    db = SessionLocal()

    agent = db.query(Agent).filter(Agent.agent_token == token).first()
    if not agent:
        return jsonify({"error": "Invalid agent token"}), 401

    result = data.get("results", {})

    # Extract real values from CIS report
    score = result.get("score_percent", 75)
    passed = result.get("passed_count", 10)
    failed = result.get("failed_count", 5)

    scan = ScanResult(
        agent_id=agent.id,
        benchmark_name="CIS Benchmark",
        score_percent=score,
        passed_count=passed,
        failed_count=failed
    )

    db.add(scan)
    db.commit()
    db.close()

    return jsonify({"message": "Scan uploaded successfully"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)