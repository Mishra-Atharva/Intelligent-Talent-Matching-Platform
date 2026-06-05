"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2

def create_job_application(job_id: int, candidate_id: int, status: str = "Pending"):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO job_applications (job_id, candidate_id, status)
            VALUES (%s, %s, %s)
            RETURNING application_id, job_id, candidate_id, status, applied_at
        """, (job_id, candidate_id, status))

        row = cur.fetchone()
        conn.commit()

        return {
            'application_id': row[0],
            'job_id': row[1],
            'candidate_id': row[2],
            'status': row[3],
            'applied_at': row[4]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.UniqueViolation):
            raise HTTPException(status_code=409, detail="Application Already Exists")
        if isinstance(e, psycopg2.errors.ForeignKeyViolation):
            raise HTTPException(status_code=422, detail="Invalid job_id or candidate_id")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_job_application(application_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT application_id, job_id, candidate_id, status, applied_at
            FROM job_applications WHERE application_id = %s
        """, (application_id,))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Application Not Found")

        return {
            'application_id': row[0],
            'job_id': row[1],
            'candidate_id': row[2],
            'status': row[3],
            'applied_at': row[4]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def update_job_application(application_id: int, status: str):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE job_applications SET status = %s WHERE application_id = %s
            RETURNING application_id, job_id, candidate_id, status, applied_at
        """, (status, application_id))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Application Not Found")

        return {
            'application_id': row[0],
            'job_id': row[1],
            'candidate_id': row[2],
            'status': row[3],
            'applied_at': row[4]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def delete_job_application(application_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM job_applications WHERE application_id = %s RETURNING application_id", (application_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Application Not Found")

        return {"message": "Application deleted successfully"}

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)
