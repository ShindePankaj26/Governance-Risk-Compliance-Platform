from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.models import ComplianceFramework, ComplianceControl
from app.schemas.schemas import FrameworkResponse, ControlUpdate
from app.core.security import get_current_user

router = APIRouter()


@router.get("/frameworks", response_model=List[FrameworkResponse])
async def list_frameworks(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(ComplianceFramework))
    return result.scalars().all()


@router.get("/frameworks/{fw_id}", response_model=FrameworkResponse)
async def get_framework(
    fw_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ComplianceFramework).where(ComplianceFramework.id == fw_id)
    )
    fw = result.scalar_one_or_none()
    if not fw:
        raise HTTPException(status_code=404, detail="Framework not found")
    return fw


@router.get("/frameworks/{fw_id}/controls")
async def list_controls(
    fw_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ComplianceControl).where(ComplianceControl.framework_id == fw_id)
    )
    controls = result.scalars().all()
    return controls


@router.put("/controls/{control_id}")
async def update_control(
    control_id: int,
    data: ControlUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ComplianceControl).where(ComplianceControl.id == control_id)
    )
    control = result.scalar_one_or_none()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(control, field, value)

    # Recalculate framework score
    fw_result = await db.execute(
        select(ComplianceControl).where(
            ComplianceControl.framework_id == control.framework_id
        )
    )
    all_controls = fw_result.scalars().all()
    compliant = sum(1 for c in all_controls if c.status == "Compliant")
    total = len(all_controls)

    fw_q = await db.execute(
        select(ComplianceFramework).where(
            ComplianceFramework.id == control.framework_id
        )
    )
    fw = fw_q.scalar_one_or_none()
    if fw and total > 0:
        fw.compliant_controls = compliant
        fw.score = round((compliant / total) * 100, 1)

    await db.commit()
    await db.refresh(control)
    return control


@router.get("/score")
async def overall_compliance_score(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(ComplianceFramework))
    frameworks = result.scalars().all()
    if not frameworks:
        return {"score": 0, "frameworks": 0}
    avg_score = sum(f.score for f in frameworks) / len(frameworks)
    return {"score": round(avg_score, 1), "frameworks": len(frameworks)}
