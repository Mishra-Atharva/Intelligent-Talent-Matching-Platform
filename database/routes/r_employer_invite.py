"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException

from routes.models.m_employer_invite import *
from routes.functions.f_employer_invite import *

router = APIRouter()

@router.post("/create", response_model=EmployerInviteDetail, status_code=201)
def send_invite(body: EmployerInviteCreate):
    res = create_invite(
        employer_id=body.employer_id,
        candidate_id=body.candidate_id,
        job_id=body.job_id,
        message=body.message,
        status=body.status
    )

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{invite_id}", response_model=EmployerInviteDetail, status_code=200)
def get_invite_endpoint(invite_id: int):
    res = get_invite(invite_id)
    return res

@router.put("/{invite_id}", response_model=EmployerInviteDetail, status_code=200)
def update_invite_endpoint(invite_id: int, body: EmployerInviteUpdate):
    res = update_invite(invite_id=invite_id, status=body.status)
    return res

@router.delete("/{invite_id}", status_code=200)
def delete_invite_endpoint(invite_id: int):
    res = delete_invite(invite_id)
    return res
