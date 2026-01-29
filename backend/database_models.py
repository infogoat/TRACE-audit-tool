from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# ---------------- AGENT ----------------

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, nullable=False)  # system name
    os_name = Column(String(64))
    password_hash = Column(String(256))
    ip_address = Column(String(64), nullable=True)
    # agent_token = Column(String(128), unique=True, nullable=True)

    # user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime)

    # user = relationship("User", back_populates="agents")
    scan_results = relationship(
        "ScanResult",
        back_populates="agent",
        cascade="all, delete-orphan"
    )
    

class System(Base):
    __tablename__ = "systems"

    id = Column(Integer, primary_key=True)
    system_name = Column(String(128))
    os_name = Column(String(64))
    ip_address = Column(String(64))
    created_at = Column(DateTime)
    # last_seen = Column(DateTime, default=datetime.utcnow)
    # status = Column(String(32), default="Healthy")


# ---------------- SCAN RESULT ----------------
class ScanResult(Base):
    __tablename__ = "scan_results"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    benchmark_name = Column(String(128))
    score_percent = Column(Float)
    passed_count = Column(Integer)
    failed_count = Column(Integer)
    scan_time = Column(DateTime, default=datetime.utcnow)

    agent = relationship("Agent", back_populates="scan_results")
    check_details = relationship("CheckDetail", back_populates="scan_result", cascade="all, delete-orphan")


# ---------------- CHECK DETAIL ----------------
class CheckDetail(Base):
    __tablename__ = "check_details"
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scan_results.id"))
    cis_id = Column(String(128))
    title = Column(String(256))
    status = Column(String(32))
    remediation = Column(Text)
    compliance_tags = Column(String(256))

    scan_result = relationship("ScanResult", back_populates="check_details")


# ---------------- USER ----------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    system_name = Column(String(128), unique=True, nullable=False)
    password_hash = Column(String(256))
    created_at = Column(DateTime)


    # agents = relationship(
    #     "Agent",
    #     back_populates="user",
    #     cascade="all, delete-orphan"
    # )
