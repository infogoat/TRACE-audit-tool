# app/database_models.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

# This is the base class from which all defined classes will inherit.
Base = declarative_base()

# --- Enum for User Roles ---
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    USER = "user"

# ====================================================================
# 1. User Model (Authentication & RBAC)
# ====================================================================
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # Role-based Access Control (RBAC) is essential for security
    role = Column(Enum(UserRole), default=UserRole.ANALYST, nullable=False)
    is_active = Column(Boolean, default=True)

# ====================================================================
# 2. Agent Model (The Scanned Host/Endpoint)
# ====================================================================
class Agent(Base):
    __tablename__ = 'agents'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # e.g., web-server-01.prod
    os_name = Column(String)                                     # e.g., Windows 2016
    
    # Relationship to ScanResult: An Agent can have many ScanResults
    scan_results = relationship("ScanResult", back_populates="agent")
    
# ====================================================================
# 3. ScanResult Model (Provenance / One entry per successful audit run)
# ====================================================================
class ScanResult(Base):
    __tablename__ = 'scan_results'

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey('agents.id'), nullable=False)
    
    # Metadata about the run
    scan_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    benchmark_name = Column(String, nullable=False) # e.g., CIS Windows 2016 L1
    
    # Summary of the run
    score_percent = Column(Float, default=0.0)
    passed_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    
    # Relationships
    agent = relationship("Agent", back_populates="scan_results")
    check_details = relationship("CheckDetail", back_populates="scan_result")

# ====================================================================
# 4. CheckDetail Model (Detailed findings from executor.py)
# ====================================================================
class CheckDetail(Base):
    __tablename__ = 'check_details'
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey('scan_results.id'), nullable=False)

    # Core Rule Info (from parser.py/sca_structs.py)
    cis_id = Column(String, index=True, nullable=False)   # e.g., "16001" or "2.3.1.2"
    title = Column(String)
    status = Column(String)                               # "PASS" or "FAIL"
    remediation = Column(String)
    
    # Store complex compliance references as JSON (PostgreSQL's JSON type)
    # The structure List[Dict[str, List[str]]] fits best as JSON/JSONB
    compliance_tags = Column(JSON) 
    
    # Relationship
    scan_result = relationship("ScanResult", back_populates="check_details")