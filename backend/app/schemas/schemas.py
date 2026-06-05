from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str = "viewer"
    department: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str


# ─── Risk ─────────────────────────────────────────────────────────────────────
class RiskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    likelihood: str
    impact: str
    treatment: Optional[str] = None
    owner: Optional[str] = None
    mitigation_plan: Optional[str] = None


class RiskCreate(RiskBase):
    pass


class RiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    likelihood: Optional[str] = None
    impact: Optional[str] = None
    treatment: Optional[str] = None
    owner: Optional[str] = None
    status: Optional[str] = None
    mitigation_plan: Optional[str] = None


class RiskResponse(RiskBase):
    id: int
    risk_id: str
    risk_score: Optional[int]
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Vendor ───────────────────────────────────────────────────────────────────
class VendorBase(BaseModel):
    name: str
    tier: Optional[str] = None
    data_sensitivity: Optional[str] = None
    iso_certified: bool = False
    soc2_certified: bool = False
    pen_test_done: bool = False
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    notes: Optional[str] = None


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    tier: Optional[str] = None
    data_sensitivity: Optional[str] = None
    trust_score: Optional[int] = None
    risk_level: Optional[str] = None
    iso_certified: Optional[bool] = None
    soc2_certified: Optional[bool] = None
    pen_test_done: Optional[bool] = None


class VendorResponse(VendorBase):
    id: int
    trust_score: int
    risk_level: Optional[str]
    last_assessed: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Compliance ───────────────────────────────────────────────────────────────
class FrameworkResponse(BaseModel):
    id: int
    name: str
    version: Optional[str]
    total_controls: int
    compliant_controls: int
    partial_controls: int
    nc_controls: int
    score: float
    owner: Optional[str]
    next_review: Optional[datetime]

    class Config:
        from_attributes = True


class ControlUpdate(BaseModel):
    status: Optional[str] = None
    evidence: Optional[str] = None
    owner: Optional[str] = None


# ─── Audit ────────────────────────────────────────────────────────────────────
class AuditBase(BaseModel):
    title: str
    audit_type: str
    scope: Optional[str] = None
    auditor: Optional[str] = None
    owner: Optional[str] = None
    framework: Optional[str] = None


class AuditCreate(AuditBase):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AuditResponse(AuditBase):
    id: int
    progress: int
    status: str
    findings_count: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]

    class Config:
        from_attributes = True


class FindingCreate(BaseModel):
    title: str
    severity: str
    description: Optional[str] = None
    recommendation: Optional[str] = None
    owner: Optional[str] = None
    due_date: Optional[datetime] = None


class FindingResponse(FindingCreate):
    id: int
    audit_id: int
    status: str

    class Config:
        from_attributes = True


# ─── Policy ───────────────────────────────────────────────────────────────────
class PolicyBase(BaseModel):
    title: str
    description: Optional[str] = None
    owner: Optional[str] = None
    department: Optional[str] = None
    version: Optional[str] = None
    mapped_frameworks: Optional[str] = None


class PolicyCreate(PolicyBase):
    review_date: Optional[datetime] = None
    next_review: Optional[datetime] = None


class PolicyResponse(PolicyBase):
    id: int
    policy_id: str
    status: str
    review_date: Optional[datetime]
    next_review: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── AI Governance ────────────────────────────────────────────────────────────
class AISystemBase(BaseModel):
    name: str
    department: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[str] = None
    bias_status: Optional[str] = None
    explainability: Optional[str] = None
    data_type: Optional[str] = None
    framework: Optional[str] = None
    owner: Optional[str] = None
    model_version: Optional[str] = None


class AISystemCreate(AISystemBase):
    pass


class AISystemResponse(AISystemBase):
    id: int
    trust_score: int
    status: str
    incident_count: int
    last_assessed: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────────────────────────────
class DashboardMetrics(BaseModel):
    total_risks: int
    critical_risks: int
    compliance_score: float
    vendor_avg_score: float
    open_audits: int
    active_policies: int
    ai_systems: int
    high_risk_ai: int
