from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.database import Base


class RiskCategory(str, enum.Enum):
    CYBERSECURITY = "Cybersecurity"
    OPERATIONAL = "Operational"
    FINANCIAL = "Financial"
    REGULATORY = "Regulatory"
    VENDOR = "Vendor"
    AI_RISK = "AI Risk"
    PHYSICAL = "Physical"


class RiskLikelihood(str, enum.Enum):
    RARE = "Rare"
    UNLIKELY = "Unlikely"
    POSSIBLE = "Possible"
    LIKELY = "Likely"
    ALMOST_CERTAIN = "Almost Certain"


class RiskImpact(str, enum.Enum):
    INSIGNIFICANT = "Insignificant"
    MINOR = "Minor"
    MODERATE = "Moderate"
    MAJOR = "Major"
    CATASTROPHIC = "Catastrophic"


class RiskTreatment(str, enum.Enum):
    MITIGATE = "Mitigate"
    TRANSFER = "Transfer"
    ACCEPT = "Accept"
    AVOID = "Avoid"


class StatusEnum(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"
    ESCALATED = "Escalated"
    REMEDIATION = "Remediation"
    MONITORING = "Monitoring"


# ─── Users ────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(50), unique=True, nullable=False)
    email         = Column(String(100), unique=True, nullable=False)
    full_name     = Column(String(100))
    hashed_password = Column(String(255), nullable=False)
    role          = Column(String(30), default="viewer")   # admin, cro, ciso, dpo, auditor, viewer
    department    = Column(String(100))
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


# ─── Risks ────────────────────────────────────────────────────────────────────
class Risk(Base):
    __tablename__ = "risks"
    id            = Column(Integer, primary_key=True, index=True)
    risk_id       = Column(String(20), unique=True, nullable=False)   # e.g. R-001
    title         = Column(String(200), nullable=False)
    description   = Column(Text)
    category      = Column(SAEnum(RiskCategory), nullable=False)
    likelihood    = Column(SAEnum(RiskLikelihood), nullable=False)
    impact        = Column(SAEnum(RiskImpact), nullable=False)
    risk_score    = Column(Integer)
    treatment     = Column(SAEnum(RiskTreatment))
    owner         = Column(String(100))
    status        = Column(SAEnum(StatusEnum), default=StatusEnum.OPEN)
    mitigation_plan = Column(Text)
    residual_risk = Column(Integer)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())


# ─── Vendors ──────────────────────────────────────────────────────────────────
class Vendor(Base):
    __tablename__ = "vendors"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(200), nullable=False)
    tier          = Column(String(20))          # Tier 1 / 2 / 3
    data_sensitivity = Column(String(30))
    trust_score   = Column(Integer, default=0)
    risk_level    = Column(String(20))
    iso_certified = Column(Boolean, default=False)
    soc2_certified = Column(Boolean, default=False)
    pen_test_done = Column(Boolean, default=False)
    last_assessed = Column(DateTime(timezone=True))
    next_review   = Column(DateTime(timezone=True))
    contact_name  = Column(String(100))
    contact_email = Column(String(100))
    notes         = Column(Text)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


# ─── Compliance Frameworks ────────────────────────────────────────────────────
class ComplianceFramework(Base):
    __tablename__ = "compliance_frameworks"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)   # ISO 27001
    version       = Column(String(20))
    total_controls = Column(Integer, default=0)
    compliant_controls = Column(Integer, default=0)
    partial_controls = Column(Integer, default=0)
    nc_controls   = Column(Integer, default=0)
    score         = Column(Float, default=0.0)
    next_review   = Column(DateTime(timezone=True))
    owner         = Column(String(100))
    controls      = relationship("ComplianceControl", back_populates="framework")


class ComplianceControl(Base):
    __tablename__ = "compliance_controls"
    id            = Column(Integer, primary_key=True, index=True)
    framework_id  = Column(Integer, ForeignKey("compliance_frameworks.id"))
    control_id    = Column(String(30))         # e.g. A.5.1
    title         = Column(String(200))
    description   = Column(Text)
    status        = Column(String(30), default="Not Started")  # Compliant / Partial / Non-compliant
    evidence      = Column(Text)
    owner         = Column(String(100))
    due_date      = Column(DateTime(timezone=True))
    framework     = relationship("ComplianceFramework", back_populates="controls")


# ─── Audits ───────────────────────────────────────────────────────────────────
class Audit(Base):
    __tablename__ = "audits"
    id            = Column(Integer, primary_key=True, index=True)
    title         = Column(String(200), nullable=False)
    audit_type    = Column(String(30))       # Internal / External
    scope         = Column(Text)
    auditor       = Column(String(100))
    owner         = Column(String(100))
    start_date    = Column(DateTime(timezone=True))
    end_date      = Column(DateTime(timezone=True))
    progress      = Column(Integer, default=0)
    status        = Column(String(30), default="Planning")
    findings_count = Column(Integer, default=0)
    framework     = Column(String(100))
    findings      = relationship("AuditFinding", back_populates="audit")


class AuditFinding(Base):
    __tablename__ = "audit_findings"
    id            = Column(Integer, primary_key=True, index=True)
    audit_id      = Column(Integer, ForeignKey("audits.id"))
    title         = Column(String(200))
    severity      = Column(String(20))        # Critical / High / Medium / Low
    description   = Column(Text)
    recommendation = Column(Text)
    status        = Column(String(30), default="Open")
    due_date      = Column(DateTime(timezone=True))
    owner         = Column(String(100))
    audit         = relationship("Audit", back_populates="findings")


# ─── Policies ─────────────────────────────────────────────────────────────────
class Policy(Base):
    __tablename__ = "policies"
    id            = Column(Integer, primary_key=True, index=True)
    policy_id     = Column(String(20), unique=True)    # POL-001
    title         = Column(String(200), nullable=False)
    description   = Column(Text)
    owner         = Column(String(100))
    department    = Column(String(100))
    version       = Column(String(20))
    status        = Column(String(30), default="Draft")  # Active / Under Review / Overdue / Retired
    review_date   = Column(DateTime(timezone=True))
    next_review   = Column(DateTime(timezone=True))
    mapped_frameworks = Column(Text)          # comma-separated
    document_url  = Column(String(500))
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


# ─── AI Governance ────────────────────────────────────────────────────────────
class AISystem(Base):
    __tablename__ = "ai_systems"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(200), nullable=False)
    department    = Column(String(100))
    description   = Column(Text)
    risk_level    = Column(String(20))        # High / Limited / Minimal
    trust_score   = Column(Integer, default=0)
    bias_status   = Column(String(30))        # None / Detected / Monitoring
    explainability = Column(String(20))        # High / Medium / Low
    data_type     = Column(String(100))
    status        = Column(String(30), default="Active")
    framework     = Column(String(200))        # EU AI Act / ISO 42001
    owner         = Column(String(100))
    last_assessed = Column(DateTime(timezone=True))
    model_version = Column(String(50))
    training_data_source = Column(Text)
    incident_count = Column(Integer, default=0)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
