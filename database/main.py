"""
    Author: Atharva 
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import db

from routes.r_user import router as user_router
from routes.r_candidate_profile import router as candidate_profile_router
from routes.r_candidate_work_experience import router as candidate_work_experience_router
from routes.r_candidate_skills import router as candidate_skills_router
from routes.r_employer_profile import router as employer_profile_router
from routes.r_job_posting import router as job_posting_router
from routes.r_job_posting_skills import router as job_posting_skills_router
from routes.r_job_application import router as job_application_router
from routes.r_saved_job import router as saved_job_router
from routes.r_employer_invite import router as employer_invite_router
from routes.r_alert import router as alert_router

async def delayed_startup():
    await asyncio.sleep(5)
    print("Server is live!")
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        await loop.run_in_executor(pool, db.create_admin)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(delayed_startup())
    yield
    task.cancel()
    print("Server shutting down")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/user", tags=["Users"])
app.include_router(candidate_profile_router, prefix="/api/candidate/profile", tags=["Candidate Profile"])
app.include_router(candidate_work_experience_router, prefix="/api/candidate/experience", tags=["Candidate Experience"])
app.include_router(candidate_skills_router, prefix="/api/candidate/skills", tags=["Candidate Skills"])
app.include_router(employer_profile_router, prefix="/api/employer/profile", tags=["Employer Profile"])
app.include_router(job_posting_router, prefix="/api/jobs", tags=["Job Postings"])
app.include_router(job_posting_skills_router, prefix="/api/jobs/skills", tags=["Job Skills"])
app.include_router(job_application_router, prefix="/api/applications", tags=["Job Applications"])
app.include_router(saved_job_router, prefix="/api/saved-jobs", tags=["Saved Jobs"])
app.include_router(employer_invite_router, prefix="/api/invites", tags=["Invites"])
app.include_router(alert_router, prefix="/api/alert", tags=["Alerts"])