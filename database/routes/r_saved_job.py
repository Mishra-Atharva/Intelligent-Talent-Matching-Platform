"""
    Author: Atharva
"""

from fastapi import APIRouter, HTTPException

from routes.models.m_saved_job import *
from routes.functions.f_saved_job import *

router = APIRouter()

@router.post("/save", response_model=SavedJobDetail, status_code=201)
def save_job_endpoint(body: SavedJobCreate):
    res = save_job(candidate_id=body.candidate_id, job_id=body.job_id)

    if res is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    return res

@router.get("/{saved_id}", response_model=SavedJobDetail, status_code=200)
def get_saved_job_endpoint(saved_id: int):
    res = get_saved_job(saved_id)
    return res

@router.get("/candidate/{candidate_id}", status_code=200)
def get_candidate_jobs(candidate_id: int):
    res = get_candidate_saved_jobs(candidate_id)
    return res

@router.delete("/{saved_id}", status_code=200)
def unsave_job(saved_id: int):
    res = remove_saved_job(saved_id)
    return res
