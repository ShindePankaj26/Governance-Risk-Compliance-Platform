from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Policy
from app.schemas.schemas import PolicyCreate, PolicyResponse
from app.core.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[PolicyResponse])
async def list_policies(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(Policy)
    if status:
        query = query.where(Policy.status == status)
    result = await db.execute(query.order_by(Policy.id))
    return result.scalars().all()


@router.post("/", response_model=PolicyResponse, status_code=201)
async def create_policy(
    data: PolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    count_result = await db.execute(select(func.count(Policy.id)))
    count = count_result.scalar() + 1
    policy_id = f"POL-{count:03d}"

    policy = Policy(**data.model_dump(), policy_id=policy_id, status="Draft")
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    return policy


@router.put("/{policy_id}/status")
async def update_policy_status(
    policy_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Policy).where(Policy.id == policy_id))
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.status = status
    await db.commit()
    return {"message": "Status updated"}


@router.delete("/{policy_id}", status_code=204)
async def delete_policy(
    policy_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Policy).where(Policy.id == policy_id))
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    await db.delete(policy)
    await db.commit()
