"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException

from routes.models.m_employer_profile import *
from routes.functions.f_employer_profile import *

router = APIRouter()

@router.post("/create", response_model=EmployerProfileDetail, status_code=201)
def create_profile(body: EmployerProfileCreate):
    res = create_employer_profile(
        user_id=body.user_id,
        company_name=body.company_name,
        industry=body.industry,
        company_size=body.company_size,
        location=body.location,
        website=body.website,
        established=body.established,
        description=body.description
    )

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{profile_id}", response_model=EmployerProfileDetail, status_code=200)
def get_profile(profile_id: int):
    res = get_employer_profile(profile_id)
    return res

@router.put("/{profile_id}", response_model=EmployerProfileDetail, status_code=200)
def update_profile(profile_id: int, body: EmployerProfileUpdate):
    res = update_employer_profile(
        profile_id=profile_id,
        company_name=body.company_name,
        industry=body.industry,
        company_size=body.company_size,
        location=body.location,
        website=body.website,
        established=body.established,
        description=body.description
    )
    return res

@router.delete("/{profile_id}", status_code=200)
def delete_profile(profile_id: int):
    res = delete_employer_profile(profile_id)
    return res
