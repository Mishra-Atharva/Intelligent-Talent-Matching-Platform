"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException

from routes.models.m_candidate_work_experience import *
from routes.functions.f_candidate_work_experience import *

router = APIRouter()

@router.post("/create", response_model=CandidateWorkExperienceDetail, status_code=201)
def create_experience(body: CandidateWorkExperienceCreate):
    res = create_work_experience(
        user_id=body.user_id,
        company=body.company,
        role=body.role,
        start_date=body.start_date,
        end_date=body.end_date
    )

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{experience_id}", response_model=CandidateWorkExperienceDetail, status_code=200)
def get_experience(experience_id: int):
    res = get_work_experience(experience_id)
    return res

@router.put("/{experience_id}", response_model=CandidateWorkExperienceDetail, status_code=200)
def update_experience(experience_id: int, body: CandidateWorkExperienceUpdate):
    res = update_work_experience(
        experience_id=experience_id,
        company=body.company,
        role=body.role,
        start_date=body.start_date,
        end_date=body.end_date
    )
    return res

@router.delete("/{experience_id}", status_code=200)
def delete_experience(experience_id: int):
    res = delete_work_experience(experience_id)
    return res
