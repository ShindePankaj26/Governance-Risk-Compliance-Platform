from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import get_db
from app.models.models import Risk, Vendor, Audit, Policy, AISystem, ComplianceFramework
from app.schemas.schemas import DashboardMetrics
from app.core.security import get_current_user

router = APIRouter()


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Risks
    total_risks = (await db.execute(select(func.count(Risk.id)))).scalar()
    critical_risks = (
        await db.execute(
            select(func.count(Risk.id)).where(Risk.risk_score >= 16)
        )
    ).scalar()

    # Compliance average
    fw_result = await db.execute(select(ComplianceFramework))
    frameworks = fw_result.scalars().all()
    compliance_score = (
        sum(f.score for f in frameworks) / len(frameworks) if frameworks else 0
    )

    # Vendor avg score
    vendor_avg = (
        await db.execute(select(func.avg(Vendor.trust_score)))
    ).scalar() or 0

    # Open audits
    open_audits = (
        await db.execute(
            select(func.count(Audit.id)).where(
                Audit.status.in_(["Planning", "In Progress"])
            )
        )
    ).scalar()

    # Active policies
    active_policies = (
        await db.execute(
            select(func.count(Policy.id)).where(Policy.status == "Active")
        )
    ).scalar()

    # AI systems
    ai_systems = (await db.execute(select(func.count(AISystem.id)))).scalar()
    high_risk_ai = (
        await db.execute(
            select(func.count(AISystem.id)).where(AISystem.risk_level == "High")
        )
    ).scalar()

    return DashboardMetrics(
        total_risks=total_risks or 0,
        critical_risks=critical_risks or 0,
        compliance_score=round(compliance_score, 1),
        vendor_avg_score=round(float(vendor_avg), 1),
        open_audits=open_audits or 0,
        active_policies=active_policies or 0,
        ai_systems=ai_systems or 0,
        high_risk_ai=high_risk_ai or 0,
    )


@router.get("/alerts")
async def get_recent_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Return open/escalated risks as alerts
    result = await db.execute(
        select(Risk)
        .where(Risk.status.in_(["Open", "Escalated"]))
        .order_by(Risk.risk_score.desc())
        .limit(10)
    )
    risks = result.scalars().all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "module": "Risk",
            "severity": "Critical" if r.risk_score >= 16 else "High" if r.risk_score >= 10 else "Medium",
            "status": r.status,
            "owner": r.owner,
        }
        for r in risks
    ]
