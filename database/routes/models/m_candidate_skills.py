"""
    Author: Atharva
"""

from pydantic import BaseModel

class CandidateSkillCreate(BaseModel):
    user_id: int
    skill: str

class CandidateSkillDetail(BaseModel):
    skill_id: int
    user_id: int
    skill: str
