from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from database_models import Base, Agent, ScanResult, CheckDetail, User
import os

# ---------------- APP SETUP ----------------
app = Flask(__name__)
CORS(app)

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

# ---------------- DASHBOARD AGGREGATION ----------------
@app.route("/api/dashboard/overview", methods=["GET"])
def get_dashboard_overview():
    db = SessionLocal()

    # Total agents
    total_agents = db.query(Agent).count()

    # Latest scan time per agent
    latest_scan_times = (
        db.query(
            ScanResult.agent_id,
            func.max(ScanResult.scan_time).label("latest_time")
        )
        .group_by(ScanResult.agent_id)
        .subquery()
    )

    # Latest score per agent
    latest_scores = (
        db.query(ScanResult.score_percent)
        .join(
            latest_scan_times,
            (ScanResult.agent_id == latest_scan_times.c.agent_id)
            & (ScanResult.scan_time == latest_scan_times.c.latest_time)
        )
        .all()
    )

    latest_score_values = [s[0] for s in latest_scores]
    avg_score = (
        round(sum(latest_score_values) / len(latest_score_values), 2)
        if latest_score_values else 0
    )

    # Total failed checks
    total_issues = (
        db.query(func.sum(ScanResult.failed_count)).scalar() or 0
    )

    # Security posture
    if avg_score >= 80:
        posture = "Excellent"
    elif avg_score >= 50:
        posture = "Needs Improvement"
    else:
        posture = "Poor" if total_agents > 0 else "No Data"

    db.close()

    return jsonify({
        "securityScore": avg_score,
        "totalAgents": total_agents,
        "totalIssues": total_issues,
        "posture": posture
    })
# ---------------- AGENT UPLOAD ----------------
@app.route("/api/upload", methods=["POST"])
def upload_scan():
    data = request.json
    db = SessionLocal()

    hostname = data.get("hostname")
    os_name = data.get("os")
    results = data.get("results", {})

    # Create agent
    agent = Agent(
        name=hostname,
        os_name=os_name
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)

    checks = results.get("checks", [])
    total_checks = len(checks)
    failed = sum(1 for c in checks if c.get("status") == "fail")
    passed = total_checks - failed
    score = round((passed / total_checks) * 100, 2) if total_checks else 0

    scan = ScanResult(
        agent_id=agent.id,
        benchmark_name=results.get("benchmark", "CIS"),
        score_percent=score,
        passed_count=passed,
        failed_count=failed,
        scan_time=datetime.utcnow()
    )
    db.add(scan)
    db.commit()
    db.close()

    return jsonify({
        "message": "Scan uploaded successfully",
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
