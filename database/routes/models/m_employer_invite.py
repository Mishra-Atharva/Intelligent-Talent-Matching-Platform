"""
    Author: Atharva
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EmployerInviteCreate(BaseModel):
    employer_id: int
    candidate_id: int
    job_id: Optional[int] = None
    message: Optional[str] = None
    status: str = "Sent"

class EmployerInviteUpdate(BaseModel):
    status: str

class EmployerInviteDetail(BaseModel):
    invite_id: int
    employer_id: int
    candidate_id: int
    job_id: Optional[int]
    message: Optional[str]
    status: str
    sent_at: datetime
