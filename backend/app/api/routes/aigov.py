from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.db.database import get_db
from app.models.models import AISystem
from app.schemas.schemas import AISystemCreate, AISystemResponse
from app.core.security import get_current_user

router = APIRouter()


def compute_trust_score(system: AISystem) -> int:
    score = 70
    if system.risk_level == "High":     score -= 20
    if system.risk_level == "Limited":  score -= 5
    if system.bias_status == "Detected": score -= 15
    if system.bias_status == "Monitoring": score -= 5
    if system.explainability == "Low":  score -= 10
    if system.explainability == "High": score += 15
    return max(min(score, 100), 10)


@router.get("/", response_model=List[AISystemResponse])
async def list_ai_systems(
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(AISystem)
    if risk_level:
        query = query.where(AISystem.risk_level == risk_level)
    if status:
        query = query.where(AISystem.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=AISystemResponse, status_code=201)
async def register_ai_system(
    data: AISystemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    system = AISystem(**data.model_dump(), status="Active")
    system.trust_score = compute_trust_score(system)
    db.add(system)
    await db.commit()
    await db.refresh(system)
    return system


@router.get("/{system_id}", response_model=AISystemResponse)
async def get_ai_system(
    system_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(AISystem).where(AISystem.id == system_id))
    system = result.scalar_one_or_none()
    if not system:
        raise HTTPException(status_code=404, detail="AI system not found")
    return system


@router.put("/{system_id}/incident")
async def report_incident(
    system_id: int,
    description: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(AISystem).where(AISystem.id == system_id))
    system = result.scalar_one_or_none()
    if not system:
        raise HTTPException(status_code=404, detail="AI system not found")
    system.incident_count += 1
    system.trust_score = max(system.trust_score - 5, 10)
    await db.commit()
    return {"message": "Incident recorded", "total_incidents": system.incident_count}
