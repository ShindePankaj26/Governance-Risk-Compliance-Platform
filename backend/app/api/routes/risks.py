from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Risk
from app.schemas.schemas import RiskCreate, RiskUpdate, RiskResponse
from app.core.security import get_current_user

router = APIRouter()

LIKELIHOOD_SCORE = {"Rare": 1, "Unlikely": 2, "Possible": 3, "Likely": 4, "Almost Certain": 5}
IMPACT_SCORE = {"Insignificant": 1, "Minor": 2, "Moderate": 3, "Major": 4, "Catastrophic": 5}


def compute_risk_score(likelihood: str, impact: str) -> int:
    return LIKELIHOOD_SCORE.get(likelihood, 1) * IMPACT_SCORE.get(impact, 1)


@router.get("/", response_model=List[RiskResponse])
async def list_risks(
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(Risk)
    if category:
        query = query.where(Risk.category == category)
    if status:
        query = query.where(Risk.status == status)
    query = query.offset(skip).limit(limit).order_by(Risk.risk_score.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=RiskResponse, status_code=201)
async def create_risk(
    data: RiskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Auto-generate risk_id
    count_result = await db.execute(select(func.count(Risk.id)))
    count = count_result.scalar() + 1
    risk_id = f"R-{count:03d}"

    score = compute_risk_score(data.likelihood, data.impact)
    risk = Risk(**data.model_dump(), risk_id=risk_id, risk_score=score)
    db.add(risk)
    await db.commit()
    await db.refresh(risk)
    return risk


@router.get("/{risk_id}", response_model=RiskResponse)
async def get_risk(
    risk_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Risk).where(Risk.id == risk_id))
    risk = result.scalar_one_or_none()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk


@router.put("/{risk_id}", response_model=RiskResponse)
async def update_risk(
    risk_id: int,
    data: RiskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Risk).where(Risk.id == risk_id))
    risk = result.scalar_one_or_none()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(risk, field, value)

    if data.likelihood or data.impact:
        risk.risk_score = compute_risk_score(
            data.likelihood or risk.likelihood,
            data.impact or risk.impact,
        )

    await db.commit()
    await db.refresh(risk)
    return risk


@router.delete("/{risk_id}", status_code=204)
async def delete_risk(
    risk_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Risk).where(Risk.id == risk_id))
    risk = result.scalar_one_or_none()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    await db.delete(risk)
    await db.commit()


@router.get("/stats/heatmap")
async def risk_heatmap(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Risk))
    risks = result.scalars().all()
    heatmap = {}
    for r in risks:
        key = f"{r.likelihood}|{r.impact}"
        heatmap[key] = heatmap.get(key, 0) + 1
    return {"heatmap": heatmap, "total": len(risks)}
