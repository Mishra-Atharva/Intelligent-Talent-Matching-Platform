"""
    Author: Atharva
"""

from pydantic import BaseModel
from datetime import datetime

class AlertCreate(BaseModel):
    user_id: int
    message: str
    status: str = "Unread"

class AlertUpdate(BaseModel):
    status: str

class AlertDetail(BaseModel):
    alert_id: int
    user_id: int
    message: str
    status: str
    created_at: datetime
