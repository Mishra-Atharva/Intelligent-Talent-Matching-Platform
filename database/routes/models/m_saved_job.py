"""
    Author: Atharva
"""

from pydantic import BaseModel
from datetime import datetime

class SavedJobCreate(BaseModel):
    candidate_id: int
    job_id: int

class SavedJobDetail(BaseModel):
    saved_id: int
    candidate_id: int
    job_id: int
    saved_at: datetime
