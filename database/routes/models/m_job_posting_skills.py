"""
    Author: Atharva
"""

from pydantic import BaseModel

class JobPostingSkillCreate(BaseModel):
    job_id: int
    skill: str

class JobPostingSkillDetail(BaseModel):
    skill_id: int
    job_id: int
    skill: str
