from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Vendor
from app.schemas.schemas import VendorCreate, VendorUpdate, VendorResponse
from app.core.security import get_current_user

router = APIRouter()


def calculate_trust_score(vendor: Vendor) -> int:
    score = 50
    if vendor.iso_certified:  score += 20
    if vendor.soc2_certified: score += 20
    if vendor.pen_test_done:  score += 10
    return min(score, 100)


def determine_risk_level(score: int) -> str:
    if score >= 80: return "Low"
    if score >= 60: return "Medium"
    return "High"


@router.get("/", response_model=List[VendorResponse])
async def list_vendors(
    risk_level: Optional[str] = None,
    tier: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(Vendor)
    if risk_level:
        query = query.where(Vendor.risk_level == risk_level)
    if tier:
        query = query.where(Vendor.tier == tier)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=VendorResponse, status_code=201)
async def create_vendor(
    data: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    vendor = Vendor(**data.model_dump())
    vendor.trust_score = calculate_trust_score(vendor)
    vendor.risk_level = determine_risk_level(vendor.trust_score)
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: int,
    data: VendorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(vendor, field, value)
    vendor.trust_score = calculate_trust_score(vendor)
    vendor.risk_level = determine_risk_level(vendor.trust_score)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}", status_code=204)
async def delete_vendor(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    await db.delete(vendor)
    await db.commit()
