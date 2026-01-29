from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from database_models import Base, Agent, ScanResult, CheckDetail, User, System
import os
import secrets
from werkzeug.security import generate_password_hash, check_password_hash

# ---------------- APP SETUP ----------------
app = Flask(__name__)
CORS(app)

@app.route("/api/auth/check-system", methods=["POST"])
def check_system():
    data = request.json
    db = SessionLocal()

    system = db.query(Agent).filter(
        Agent.name == data["system_name"]
    ).first()

    db.close()

    if system:
        return jsonify({"status": "existing"})
    else:
        return jsonify({"status": "new"})

# ---------------- REGISTER SYSTEM ------------------
@app.route("/api/systems/register", methods=["POST"])
def register_system():
    data = request.json
    db = SessionLocal()

    existing = db.query(System).filter(
        System.system_name == data["system_name"]
    ).first()

    if existing:
        db.close()
        return jsonify({"message": "System already exists"})

    system = System(
        system_name=data["system_name"],
        os_name=data["os_name"],
        ip_address=data.get("ip_address", "simulated")
    )

    db.add(system)
    db.commit()
    db.close()

    return jsonify({"message": "System registered"})


# --------------- LOGIN SYSTEM ------------------
@app.route("/api/auth/login-system", methods=["POST"])
def login_system():
    data = request.json
    db = SessionLocal()

    system = db.query(Agent).filter(
        Agent.name == data["system_name"]
    ).first()

    if not system or not check_password_hash(
        system.password_hash, data["password"]
    ):
        db.close()
        return jsonify({"error": "Invalid credentials"}), 401

    db.close()
    return jsonify({"login": "success"})

# ---------------- DATABASE SETUP ----------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./trace.db"
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

# ---------------- ROOT ----------------
@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Backend running"})

# ---------------- USERS ----------------
@app.route("/api/users", methods=["GET"])
def get_users():
    db = SessionLocal()
    users = db.query(User).all()

    resp = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "lastLogin": u.last_login.strftime("%Y-%m-%d %H:%M:%S")
            if u.last_login else None
        }
        for u in users
    ]

    db.close()
    return jsonify(resp)

# --------------------- REGISTER USERS ---------------------
import secrets

@app.route("/api/agents/register", methods=["POST"])
def register_agent():
    db = SessionLocal()
    data = request.json

    user_id = data["user_id"]
    hostname = data["hostname"]
    os_name = data["os"]

    # CHECK IF AGENT ALREADY EXISTS
    existing = (
        db.query(Agent)
        .filter(
            Agent.user_id == user_id,
            Agent.name == hostname
        )
        .first()
    )

    if existing:
        db.close()
        return jsonify({
            "agent_id": existing.id,
            "agent_token": existing.agent_token
        })

    agent_token = secrets.token_hex(32)

    agent = Agent(
        name=hostname,
        os_name=os_name,
        user_id=user_id,
        agent_token=agent_token
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)
    db.close()

    return jsonify({
        "agent_id": agent.id,
        "agent_token": agent_token
    })


@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.json
    db = SessionLocal()

    user = User(
        username=data.get("username"),
        email=data.get("email"),
        role=data.get("role"),
        status="Active",
        last_login=datetime.utcnow()
    )

    db.add(user)
    db.commit()
    db.close()

    return jsonify({"message": "User added successfully!"}), 201

@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        db.close()
        return jsonify({"error": "User not found"}), 404

    db.delete(user)
    db.commit()
    db.close()

    return "", 204

# ---------------- VULNERABILITY LIBRARY ----------------
VULNERABILITY_LIBRARY = [
    {
        "severity": "High",
        "title": "Firewall Misconfiguration Detected",
        "description": "Inbound firewall rules allow unrestricted access on critical ports.",
        "fix": "Restrict inbound ports using OS firewall (ufw / Windows Defender Firewall)."
    },
    {
        "severity": "High",
        "title": "Remote Access Policy Weakness",
        "description": "Remote login enabled for privileged accounts without MFA.",
        "fix": "Disable remote admin/root login or enforce multi-factor authentication."
    },
    {
        "severity": "Medium",
        "title": "Password Policy Non-Compliance",
        "description": "Password policy does not enforce complexity or minimum length.",
        "fix": "Enforce strong password policy per CIS benchmark guidelines."
    },
    {
        "severity": "Medium",
        "title": "Audit Logging Disabled",
        "description": "Security audit logging is not enabled for critical system events.",
        "fix": "Enable auditd (Linux) or Advanced Audit Policy (Windows)."
    },
    {
        "severity": "Low",
        "title": "Unnecessary Services Running",
        "description": "Multiple unused background services are active on the system.",
        "fix": "Disable unused services to reduce attack surface."
    }
]

# ---------------- DASHBOARD AGGREGATION ----------------
@app.route("/api/dashboard/overview", methods=["GET"])
def get_dashboard_overview():
    db = SessionLocal()
    try:
        total_agents = db.query(Agent).count()
        total_issues = db.query(func.sum(ScanResult.failed_count)).scalar() or 0

        # Latest score per agent
        latest_scan_times = (
            db.query(
                ScanResult.agent_id,
                func.max(ScanResult.scan_time).label("latest_time")
            )
            .group_by(ScanResult.agent_id)
            .subquery()
        )

        latest_scores = (
            db.query(ScanResult.score_percent)
            .join(
                latest_scan_times,
                (ScanResult.agent_id == latest_scan_times.c.agent_id)
                & (ScanResult.scan_time == latest_scan_times.c.latest_time)
            )
            .all()
        )

        score_values = [s[0] for s in latest_scores]
        avg_score = round(sum(score_values) / len(score_values), 2) if score_values else 0

        scans = (
            db.query(ScanResult, Agent.name)
            .join(Agent, ScanResult.agent_id == Agent.id)
            .order_by(ScanResult.scan_time.desc())
            .limit(10)
            .all()
        )

        audit_results = []
        vulnerabilities = []

        for scan in latest_scan_times:
            hostname = scan.agent.name

        if scan.failed_count > 0:
            audit_results.append({
                "id": f"{scan.agent_id}-{scan.id}",
                "severity": "High",
                "category": scan.benchmark_name,
                "description": f"{scan.failed_count} checks failed",
                "system": hostname
            })

        vulnerabilities.append({
            "id": f"{scan.agent_id}-{scan.id}",
            "severity": "High" if scan.failed_count > 3 else "Medium",
            "title": "System Hardening Issue",
            "status": "Open",
            "system": hostname
        })


    finally:
        db.close()

# ---------------- AUTO REMEDIATION ----------------

@app.route("/api/remediation", methods=["GET"])
def get_remediation():
    db = SessionLocal()

    scans = (
        db.query(ScanResult, Agent.name)
        .join(Agent, ScanResult.agent_id == Agent.id)
        .order_by(ScanResult.scan_time.desc())
        .limit(5)
        .all()
    )

    actions = []

    for scan, hostname in scans:
        if scan.failed_count > 0:
            actions.append({
                "id": scan.id,
                "system": hostname,
                "issue": scan.benchmark_name,
                "risk": "High",
                "recommendedAction": "Apply CIS benchmark hardening",
                "linuxFix": "sudo ufw enable && sudo systemctl restart auditd",
                "windowsFix": "Enable Windows Defender Firewall & Audit Policy",
                "status": "Suggested"
            })

    db.close()
    return jsonify(actions)

@app.route("/api/dashboard/trends", methods=["GET"])
def get_security_trends():
    db = SessionLocal()
    rows = (
        db.query(
            ScanResult.scan_time,
            ScanResult.score_percent
        )
        .order_by(ScanResult.scan_time.asc())
        .all()
    )
    db.close()

    return jsonify([
        {
            "date": r.scan_time.strftime("%Y-%m-%d %H:%M"),
            "score": r.score_percent
        }
        for r in rows
    ])

# ---------------- AGENT UPLOAD ----------------
@app.route("/api/upload", methods=["POST"])
def upload_scan():
    print(">>> /api/upload HIT")   
    # 1. Extract & validate token
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth.split(" ")[1]

    db = SessionLocal()

    # 2. Identify agent using token
    agent = db.query(Agent).filter(Agent.agent_token == token).first()
    if not agent:
        db.close()
        return jsonify({"error": "Invalid agent token"}), 403

    # 3. Read scan results
    data = request.json
    results = data.get("results", {})

    checks = results.get("checks", [])
    total_checks = len(checks)
    failed = sum(1 for c in checks if c.get("status") == "fail")
    passed = total_checks - failed
    score = round((passed / total_checks) * 100, 2) if total_checks else 0
    
    # FORCE LOGICAL FAILURE FOR WEAK PASSWORD POLICY (WINDOWS)
    if agent.os_name.lower() == "windows":
        try:
            import subprocess
            output = subprocess.check_output("net accounts", shell=True).decode()
            if "Minimum password length" in output:
                value = int(output.split("Minimum password length")[1].split()[0])
                if value == 0:
                    failed += 1
        except:
            pass


    # 4. Create scan result (agent already known)
    scan = ScanResult(
        agent_id=agent.id,
        benchmark_name=results.get("benchmark", "CIS"),
        score_percent=score,
        passed_count=passed,
        failed_count=failed,
        scan_time=datetime.utcnow()
    )

    agent_name = agent.name  # capture before close

    db.add(scan)      # SINGLE ORM OBJECT
    db.commit()
    db.close()


    return jsonify({
        "message": "Scan uploaded successfully",
        "agent": agent_name,
        "score": score,
        "passed": passed,
        "failed": failed
}), 200

    
# ---------------- RESULTS FOR FRONTEND ----------------
@app.route("/api/results", methods=["GET"])
def get_results():
    db = SessionLocal()

    scans = (
        db.query(
            Agent.name,
            Agent.os_name,
            ScanResult.benchmark_name,
            ScanResult.score_percent,
            ScanResult.passed_count,
            ScanResult.failed_count,
            ScanResult.scan_time
        )
        .join(Agent, Agent.id == ScanResult.agent_id)
        .order_by(ScanResult.scan_time.desc())
        .all()
    )

    response = []
    for s in scans:
        response.append({
            "hostname": s.name,
            "os": s.os_name,
            "benchmark": s.benchmark_name,
            "score": s.score_percent,
            "passed": s.passed_count,
            "failed": s.failed_count,
            "scan_time": s.scan_time.strftime("%Y-%m-%d %H:%M:%S")
        })

    db.close()
    return jsonify(response)



# ---------------- MAIN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
