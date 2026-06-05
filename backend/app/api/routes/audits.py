from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Audit, AuditFinding
from app.schemas.schemas import AuditCreate, AuditResponse, FindingCreate, FindingResponse
from app.core.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[AuditResponse])
async def list_audits(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(Audit)
    if status:
        query = query.where(Audit.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=AuditResponse, status_code=201)
async def create_audit(
    data: AuditCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    audit = Audit(**data.model_dump())
    db.add(audit)
    await db.commit()
    await db.refresh(audit)
    return audit


@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Audit).where(Audit.id == audit_id))
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit


@router.put("/{audit_id}/progress")
async def update_audit_progress(
    audit_id: int,
    progress: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Audit).where(Audit.id == audit_id))
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    audit.progress = min(max(progress, 0), 100)
    audit.status = status
    await db.commit()
    return {"message": "Updated", "progress": audit.progress, "status": audit.status}


@router.post("/{audit_id}/findings", response_model=FindingResponse, status_code=201)
async def add_finding(
    audit_id: int,
    data: FindingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Audit).where(Audit.id == audit_id))
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    finding = AuditFinding(**data.model_dump(), audit_id=audit_id)
    db.add(finding)
    audit.findings_count += 1
    await db.commit()
    await db.refresh(finding)
    return finding


@router.get("/{audit_id}/findings", response_model=List[FindingResponse])
async def list_findings(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AuditFinding).where(AuditFinding.audit_id == audit_id)
    )
    return result.scalars().all()
