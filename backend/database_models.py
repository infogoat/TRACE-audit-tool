from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

# ---------------- AGENT (ONE MACHINE = ONE AGENT) ----------------
class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True)
    name = Column(String(128), unique=True, nullable=False)   # hostname
    os_name = Column(String(64))
    ip_address = Column(String(64))
    role = Column(String(16))  # ADMIN or AGENT
    agent_token = Column(String(128), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan_results = relationship(
        "ScanResult",
        back_populates="agent",
        cascade="all, delete-orphan"
    )


# ---------------- SCAN RESULT ----------------
class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    benchmark_name = Column(String(128))
    score_percent = Column(Float)
    passed_count = Column(Integer)
    failed_count = Column(Integer)
    scan_time = Column(DateTime, default=datetime.utcnow)

    agent = relationship("Agent", back_populates="scan_results")
    check_details = relationship(
        "CheckDetail",
        back_populates="scan_result",
        cascade="all, delete-orphan"
    )


# ---------------- CHECK DETAIL ----------------
class CheckDetail(Base):
    __tablename__ = "check_details"

    id = Column(Integer, primary_key=True)
    scan_id = Column(Integer, ForeignKey("scan_results.id"))
    cis_id = Column(String(128))
    title = Column(String(256))
    status = Column(String(32))
    remediation = Column(Text)
    compliance_tags = Column(String(256))

    scan_result = relationship("ScanResult", back_populates="check_details")
