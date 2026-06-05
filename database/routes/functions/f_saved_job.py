"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2

def save_job(candidate_id: int, job_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO saved_jobs (candidate_id, job_id)
            VALUES (%s, %s)
            RETURNING saved_id, candidate_id, job_id, saved_at
        """, (candidate_id, job_id))

        row = cur.fetchone()
        conn.commit()

        return {
            'saved_id': row[0],
            'candidate_id': row[1],
            'job_id': row[2],
            'saved_at': row[3]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.UniqueViolation):
            raise HTTPException(status_code=409, detail="Job Already Saved")
        if isinstance(e, psycopg2.errors.ForeignKeyViolation):
            raise HTTPException(status_code=422, detail="Invalid candidate_id or job_id")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_saved_job(saved_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT saved_id, candidate_id, job_id, saved_at FROM saved_jobs WHERE saved_id = %s", (saved_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Saved Job Not Found")

        return {
            'saved_id': row[0],
            'candidate_id': row[1],
            'job_id': row[2],
            'saved_at': row[3]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_candidate_saved_jobs(candidate_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT saved_id, candidate_id, job_id, saved_at FROM saved_jobs WHERE candidate_id = %s", (candidate_id,))
        rows = cur.fetchall()
        conn.commit()

        saved_jobs = []
        for row in rows:
            saved_jobs.append({
                'saved_id': row[0],
                'candidate_id': row[1],
                'job_id': row[2],
                'saved_at': row[3]
            })

        return saved_jobs

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def remove_saved_job(saved_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM saved_jobs WHERE saved_id = %s RETURNING saved_id", (saved_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Saved Job Not Found")

        return {"message": "Saved job removed successfully"}

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)
