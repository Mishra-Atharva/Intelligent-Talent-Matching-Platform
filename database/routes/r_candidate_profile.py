"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException
from db import db

from routes.models.m_candidate_profile import *
from routes.functions.f_candidate_profile import *

router = APIRouter()

@router.post("/create", response_model=CandidateProfileDetail, status_code=201)
def create_profile(body: CandidateProfileCreate):
    res = create_candidate_profile(
        user_id=body.user_id,
        first_name=body.first_name,
        last_name=body.last_name,
        age=body.age,
        phone=body.phone,
        location=body.location,
        education_level=body.education_level,
        major=body.major,
        university=body.university,
        graduation_year=body.graduation_year,
        years_of_experience=body.years_of_experience,
        preferred_work_mode=body.preferred_work_mode,
        preferred_location=body.preferred_location,
        summary=body.summary
    )

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{profile_id}", response_model=CandidateProfileDetail, status_code=200)
def get_profile(profile_id: int):
    res = get_candidate_profile(profile_id)
    return res

@router.put("/{profile_id}", response_model=CandidateProfileDetail, status_code=200)
def update_profile(profile_id: int, body: CandidateProfileUpdate):
    res = update_candidate_profile(
        profile_id=profile_id,
        first_name=body.first_name,
        last_name=body.last_name,
        age=body.age,
        phone=body.phone,
        location=body.location,
        education_level=body.education_level,
        major=body.major,
        university=body.university,
        graduation_year=body.graduation_year,
        years_of_experience=body.years_of_experience,
        preferred_work_mode=body.preferred_work_mode,
        preferred_location=body.preferred_location,
        summary=body.summary
    )
    return res

@router.delete("/{profile_id}", status_code=200)
def delete_profile(profile_id: int):
    res = delete_candidate_profile(profile_id)
    return res
