from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from database_models import Base, Agent, ScanResult, CheckDetail, User
import os
import io
from reportlab.pdfgen import canvas

app = Flask(__name__)
CORS(app)

# --- Database Connection ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:mysecretpassword@db:5432/trace_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# --------------------------------------------------------------------------
# BASIC ROUTES
# --------------------------------------------------------------------------
@app.route("/")
def root():
    return jsonify({"message": "TRACE backend is running!"})

# --------------------------------------------------------------------------
# AGENT UPLOAD ROUTE
# --------------------------------------------------------------------------
@app.route("/api/upload", methods=["POST"])
def upload_scan():
    """Accept scan results from agent and save to DB"""
    session = SessionLocal()
    data = request.json
    hostname = data.get("hostname")
    os_name = data.get("os")
    results = data.get("results", [])

    if not hostname or not results:
        return jsonify({"error": "Missing hostname or results"}), 400

    # Check or create agent
    agent = session.query(Agent).filter_by(name=hostname).first()
    if not agent:
        agent = Agent(name=hostname, os_name=os_name)
        session.add(agent)
        session.commit()

    passed = len([r for r in results if r.get("status") == "PASS"])
    failed = len([r for r in results if r.get("status") == "FAIL"])
    score = round((passed / (passed + failed)) * 100, 2) if (passed + failed) > 0 else 0

    scan_result = ScanResult(
        agent_id=agent.id,
        benchmark_name=f"CIS {os_name}",
        score_percent=score,
        passed_count=passed,
        failed_count=failed,
        scan_time=datetime.utcnow()
    )
    session.add(scan_result)
    session.commit()

    # Store check details
    for r in results:
        detail = CheckDetail(
            scan_id=scan_result.id,
            cis_id=r.get("cis_id", "N/A"),
            title=r.get("title", "N/A"),
            status=r.get("status", "N/A"),
            remediation=r.get("remediation", "N/A"),
            compliance_tags=r.get("tags", "")
        )
        session.add(detail)
    session.commit()
    session.close()

    return jsonify({"message": f"Results uploaded for {hostname}", "score": score}), 200

# --------------------------------------------------------------------------
# DASHBOARD RESULTS
# --------------------------------------------------------------------------
@app.route("/api/results", methods=["GET"])
def get_results():
    """Return summarized scan results for dashboard and reports"""
    session = SessionLocal()
    results = session.query(ScanResult).all()
    data = []

    for r in results:
        data.append({
            "agent": r.agent.name,
            "os": r.agent.os_name,
            "score": r.score_percent,
            "passed": r.passed_count,
            "failed": r.failed_count,
            "timestamp": r.scan_time.strftime("%Y-%m-%d %H:%M:%S")
        })

    session.close()
    return jsonify(data)

# --------------------------------------------------------------------------
# AUDIT RESULT DETAILS (for System Audit Results page)
# --------------------------------------------------------------------------
@app.route("/api/audit-results", methods=["GET"])
def get_audit_results():
    """Detailed audit results per system for frontend System Audit Results table"""
    session = SessionLocal()
    results = session.query(ScanResult).all()
    data = []

    for r in results:
        severity = "Low"
        if r.score_percent < 50:
            severity = "Critical"
        elif r.score_percent < 80:
            severity = "Medium"

        data.append({
            "id": str(r.id),
            "severity": severity,
            "category": "Configuration",
            "description": f"System {r.agent.name} compliance audit result",
            "system": r.agent.name,
            "detectedOn": r.scan_time.strftime("%Y-%m-%d %H:%M:%S"),
            "suggestedFix": "Apply pending security policies" if severity != "Low" else "System compliant"
        })

    session.close()
    return jsonify(data)

# --------------------------------------------------------------------------
# CHECK DETAILS FOR A SPECIFIC AGENT
# --------------------------------------------------------------------------
@app.route("/api/details/<agent_name>", methods=["GET"])
def get_agent_details(agent_name):
    session = SessionLocal()
    agent = session.query(Agent).filter_by(name=agent_name).first()
    if not agent:
        session.close()
        return jsonify({"error": "Agent not found"}), 404

    latest_scan = session.query(ScanResult).filter_by(agent_id=agent.id).order_by(ScanResult.scan_time.desc()).first()
    if not latest_scan:
        session.close()
        return jsonify({"error": "No scans found"}), 404

    details = []
    for c in latest_scan.check_details:
        details.append({
            "cis_id": c.cis_id,
            "title": c.title,
            "status": c.status,
            "remediation": c.remediation
        })

    session.close()
    return jsonify(details)

# --------------------------------------------------------------------------
# PDF REPORT GENERATION
# --------------------------------------------------------------------------
@app.route("/api/report/<agent_name>", methods=["GET"])
def generate_report(agent_name):
    """Generate and download PDF report for a given agent"""
    session = SessionLocal()
    agent = session.query(Agent).filter_by(name=agent_name).first()
    if not agent:
        session.close()
        return jsonify({"error": "Agent not found"}), 404

    latest_scan = session.query(ScanResult).filter_by(agent_id=agent.id).order_by(ScanResult.scan_time.desc()).first()
    session.close()

    if not latest_scan:
        return jsonify({"error": "No scan data available"}), 404

    # Create PDF in memory
    pdf_buffer = io.BytesIO()
    pdf = canvas.Canvas(pdf_buffer)
    pdf.setTitle(f"TRACE Compliance Report - {agent.name}")
    pdf.drawString(100, 800, f"TRACE Compliance Report for {agent.name}")
    pdf.drawString(100, 780, f"Operating System: {agent.os_name}")
    pdf.drawString(100, 760, f"Compliance Score: {latest_scan.score_percent}%")
    pdf.drawString(100, 740, f"Passed Checks: {latest_scan.passed_count}")
    pdf.drawString(100, 720, f"Failed Checks: {latest_scan.failed_count}")
    pdf.drawString(100, 700, f"Last Scan Time: {latest_scan.scan_time.strftime('%Y-%m-%d %H:%M:%S')}")
    pdf.showPage()
    pdf.save()
    pdf_buffer.seek(0)

    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"{agent_name}_report.pdf",
        mimetype="application/pdf"
    )

# --------------------------------------------------------------------------
# USER MANAGEMENT
# --------------------------------------------------------------------------
@app.route("/api/users", methods=["GET"])
def list_users():
    session = SessionLocal()
    users = session.query(User).all()
    result = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "lastLogin": u.last_login.strftime("%Y-%m-%d %H:%M:%S") if u.last_login else None
        }
        for u in users
    ]
    session.close()
    return jsonify(result)

@app.route("/api/users", methods=["POST"])
def add_user():
    data = request.json
    session = SessionLocal()
    new_user = User(
        username=data.get("username"),
        email=data.get("email"),
        role=data.get("role", "Admin"),
        status="Active",
        last_login=datetime.utcnow()
    )
    session.add(new_user)
    session.commit()
    session.close()
    return jsonify({"message": f"User {new_user.username} added successfully!"}), 201

# --------------------------------------------------------------------------
# RUN APP
# --------------------------------------------------------------------------
if __name__ == "__main__":
    print("Starting TRACE backend...")
    app.run(host="0.0.0.0", port=8000)
