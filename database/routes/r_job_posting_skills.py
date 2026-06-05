"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException

from routes.models.m_job_posting_skills import *
from routes.functions.f_job_posting_skills import *

router = APIRouter()

@router.post("/add", response_model=JobPostingSkillDetail, status_code=201)
def add_job_posting_skill(body: JobPostingSkillCreate):
    res = add_job_skill(job_id=body.job_id, skill=body.skill)

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{skill_id}", response_model=JobPostingSkillDetail, status_code=200)
def get_posting_skill(skill_id: int):
    res = get_job_skill(skill_id)
    return res

@router.get("/job/{job_id}", status_code=200)
def get_posting_skills(job_id: int):
    res = get_job_skills(job_id)
    return res

@router.delete("/{skill_id}", status_code=200)
def remove_job_skill(skill_id: int):
    res = delete_job_skill(skill_id)
    return res
