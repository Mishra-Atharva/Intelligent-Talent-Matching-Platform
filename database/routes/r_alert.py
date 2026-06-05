"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException

from routes.models.m_alert import *
from routes.functions.f_alert import *

router = APIRouter()

@router.post("/create", response_model=AlertDetail, status_code=201)
def create_user_alert(body: AlertCreate):
    res = create_alert(user_id=body.user_id, message=body.message, status=body.status)

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{alert_id}", response_model=AlertDetail, status_code=200)
def get_user_alert(alert_id: int):
    res = get_alert(alert_id)
    return res

@router.get("/user/{user_id}", status_code=200)
def get_all_user_alerts(user_id: int):
    res = get_user_alerts(user_id)
    return res

@router.put("/{alert_id}", response_model=AlertDetail, status_code=200)
def update_user_alert(alert_id: int, body: AlertUpdate):
    res = update_alert(alert_id=alert_id, status=body.status)
    return res

@router.delete("/{alert_id}", status_code=200)
def delete_user_alert(alert_id: int):
    res = delete_alert(alert_id)
    return res
