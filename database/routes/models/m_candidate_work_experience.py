"""
    Author: Atharva
"""

from pydantic import BaseModel
from datetime import date
from typing import Optional

class CandidateWorkExperienceCreate(BaseModel):
    user_id: int
    company: str
    role: str
    start_date: date
    end_date: Optional[date] = None

class CandidateWorkExperienceUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class CandidateWorkExperienceDetail(BaseModel):
    experience_id: int
    user_id: int
    company: str
    role: str
    start_date: date
    end_date: Optional[date]
