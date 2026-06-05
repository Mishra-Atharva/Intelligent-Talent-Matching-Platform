"""
    Author: Atharva
"""
from fastapi import APIRouter, HTTPException
from db import db

# Importing Neccessary Models
from routes.models.m_user import *

# Importing Neccessary Functions
from routes.functions.f_user import *

router = APIRouter()

@router.post("/register", response_model=UserDetail, status_code=201)
def register_user(body: UserCreate):

    # Register the user
    res = reg_user(body.email, body.password, body.first_name, body.last_name)

    # Check for error
    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    return res

@router.post("/authenticate", response_model=UserDetail, status_code=200)
def authenticate_user(body: UserLogin):

    # Authenticate user
    res = auth_user(body.email, body.password)

    if res is None: 
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    return res