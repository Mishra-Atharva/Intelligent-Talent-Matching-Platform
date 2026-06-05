"""
    Author: Atharva
"""

from pydantic import BaseModel
from datetime import datetime

class JobApplicationCreate(BaseModel):
    job_id: int
    candidate_id: int
    status: str = "Pending"

class JobApplicationUpdate(BaseModel):
    status: str

class JobApplicationDetail(BaseModel):
    application_id: int
    job_id: int
    candidate_id: int
    status: str
    applied_at: datetime
