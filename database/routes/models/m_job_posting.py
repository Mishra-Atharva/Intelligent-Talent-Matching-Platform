"""
    Author: Atharva
"""

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class JobPostingCreate(BaseModel):
    employer_id: int
    title: str
    description: str
    location: str
    work_mode: str
    employment_type: str
    experience_required: Optional[str] = None
    education_required: Optional[str] = None
    salary: Optional[str] = None
    start_date: date
    end_date: date
    status: Optional[str] = "Active"

class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    experience_required: Optional[str] = None
    education_required: Optional[str] = None
    salary: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None

class JobPostingDetail(BaseModel):
    job_id: int
    employer_id: int
    title: str
    description: str
    location: str
    work_mode: str
    employment_type: str
    experience_required: Optional[str]
    education_required: Optional[str]
    salary: Optional[str]
    start_date: date
    end_date: date
    status: str
    applicants: int
    created_at: datetime
    updated_at: datetime
