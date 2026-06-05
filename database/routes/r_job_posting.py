"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException
from typing import List

from routes.models.m_job_posting import *
from routes.functions.f_job_posting import *

router = APIRouter()

@router.post("/create", response_model=JobPostingDetail, status_code=201)
def create_posting(body: JobPostingCreate):
    res = create_job_posting(
        employer_id=body.employer_id,
        title=body.title,
        description=body.description,
        location=body.location,
        work_mode=body.work_mode,
        employment_type=body.employment_type,
        experience_required=body.experience_required,
        education_required=body.education_required,
        salary=body.salary,
        start_date=body.start_date,
        end_date=body.end_date,
        status=body.status
    )

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/", response_model=List[JobPostingDetail], status_code=200)
def list_postings():
    return get_job_postings()

@router.get("/{job_id}", response_model=JobPostingDetail, status_code=200)
def get_posting(job_id: int):
    res = get_job_posting(job_id)
    return res

@router.put("/{job_id}", response_model=JobPostingDetail, status_code=200)
def update_posting(job_id: int, body: JobPostingUpdate):
    res = update_job_posting(
        job_id=job_id,
        title=body.title,
        description=body.description,
        location=body.location,
        work_mode=body.work_mode,
        employment_type=body.employment_type,
        experience_required=body.experience_required,
        education_required=body.education_required,
        salary=body.salary,
        start_date=body.start_date,
        end_date=body.end_date,
        status=body.status
    )
    return res

@router.delete("/{job_id}", status_code=200)
def delete_posting(job_id: int):
    res = delete_job_posting(job_id)
    return res
