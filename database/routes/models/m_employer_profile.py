"""
    Author: Atharva
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EmployerProfileCreate(BaseModel):
    user_id: int
    company_name: str
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    established: Optional[str] = None
    description: Optional[str] = None

class EmployerProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    established: Optional[str] = None
    description: Optional[str] = None

class EmployerProfileDetail(BaseModel):
    profile_id: int
    user_id: int
    company_name: str
    industry: Optional[str]
    company_size: Optional[str]
    location: Optional[str]
    website: Optional[str]
    established: Optional[str]
    description: Optional[str]
    updated_at: datetime
