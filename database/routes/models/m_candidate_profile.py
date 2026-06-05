"""
    Author: Atharva
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CandidateProfileCreate(BaseModel):
    user_id: int
    first_name: str
    last_name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    education_level: Optional[str] = None
    major: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[str] = None
    years_of_experience: Optional[str] = None
    preferred_work_mode: Optional[str] = None
    preferred_location: Optional[str] = None
    summary: Optional[str] = None

class CandidateProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    education_level: Optional[str] = None
    major: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[str] = None
    years_of_experience: Optional[str] = None
    preferred_work_mode: Optional[str] = None
    preferred_location: Optional[str] = None
    summary: Optional[str] = None

class CandidateProfileDetail(BaseModel):
    profile_id: int
    user_id: int
    first_name: str
    last_name: Optional[str]
    age: Optional[int]
    phone: Optional[str]
    location: Optional[str]
    education_level: Optional[str]
    major: Optional[str]
    university: Optional[str]
    graduation_year: Optional[str]
    years_of_experience: Optional[str]
    preferred_work_mode: Optional[str]
    preferred_location: Optional[str]
    summary: Optional[str]
    updated_at: datetime
