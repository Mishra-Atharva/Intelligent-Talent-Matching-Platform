"""
    Author: Atharva 
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# User Details Model
class User(BaseModel):
    user_id: int 
    email: EmailStr 
    first_name: Optional[str]
    last_name: Optional[str]
    type: str
    premium: bool = False
    token: str 
    created_at: datetime

# Creating User Model
class UserCreate(BaseModel):
    email: EmailStr
    password: str 
    first_name: str
    last_name: str

# User Login Model
class UserLogin(BaseModel):
    email: EmailStr
    password: str 

# User Details Model
class UserDetail(BaseModel):
    user_id: int 
    email: EmailStr 
    first_name: Optional[str]
    last_name: Optional[str]
    type: str
    premium: bool = False
    token: str 