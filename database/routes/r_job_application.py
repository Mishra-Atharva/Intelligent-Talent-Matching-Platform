"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException

from routes.models.m_job_application import *
from routes.functions.f_job_application import *

router = APIRouter()

@router.post("/create", response_model=JobApplicationDetail, status_code=201)
def create_application(body: JobApplicationCreate):
    res = create_job_application(
        job_id=body.job_id,
        candidate_id=body.candidate_id,
        status=body.status
    )

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{application_id}", response_model=JobApplicationDetail, status_code=200)
def get_application(application_id: int):
    res = get_job_application(application_id)
    return res

@router.put("/{application_id}", response_model=JobApplicationDetail, status_code=200)
def update_application(application_id: int, body: JobApplicationUpdate):
    res = update_job_application(application_id=application_id, status=body.status)
    return res

@router.delete("/{application_id}", status_code=200)
def delete_application(application_id: int):
    res = delete_job_application(application_id)
    return res
