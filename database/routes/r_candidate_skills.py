"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException

from routes.models.m_candidate_skills import *
from routes.functions.f_candidate_skills import *

router = APIRouter()

@router.post("/add", response_model=CandidateSkillDetail, status_code=201)
def add_user_skill(body: CandidateSkillCreate):
    res = add_skill(user_id=body.user_id, skill=body.skill)

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{skill_id}", response_model=CandidateSkillDetail, status_code=200)
def get_user_skill(skill_id: int):
    res = get_skill(skill_id)
    return res

@router.get("/user/{user_id}", status_code=200)
def get_all_user_skills(user_id: int):
    res = get_user_skills(user_id)
    return res

@router.delete("/{skill_id}", status_code=200)
def remove_skill(skill_id: int):
    res = delete_skill(skill_id)
    return res
