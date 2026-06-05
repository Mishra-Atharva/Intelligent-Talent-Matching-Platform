"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2
from datetime import date

def create_job_posting(employer_id: int, title: str, description: str, location: str, work_mode: str,
                      employment_type: str, start_date: date, end_date: date, experience_required: str = None,
                      education_required: str = None, salary: str = None, status: str = "Active"):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO job_postings (employer_id, title, description, location, work_mode, employment_type,
            experience_required, education_required, salary, start_date, end_date, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING job_id, employer_id, title, description, location, work_mode, employment_type,
            experience_required, education_required, salary, start_date, end_date, status, applicants, created_at, updated_at
        """, (employer_id, title, description, location, work_mode, employment_type, experience_required,
              education_required, salary, start_date, end_date, status))

        row = cur.fetchone()
        conn.commit()

        return {
            'job_id': row[0],
            'employer_id': row[1],
            'title': row[2],
            'description': row[3],
            'location': row[4],
            'work_mode': row[5],
            'employment_type': row[6],
            'experience_required': row[7],
            'education_required': row[8],
            'salary': row[9],
            'start_date': row[10],
            'end_date': row[11],
            'status': row[12],
            'applicants': row[13],
            'created_at': row[14],
            'updated_at': row[15]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.ForeignKeyViolation):
            raise HTTPException(status_code=422, detail="Invalid employer_id")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_job_posting(job_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT job_id, employer_id, title, description, location, work_mode, employment_type,
            experience_required, education_required, salary, start_date, end_date, status, applicants, created_at, updated_at
            FROM job_postings WHERE job_id = %s
        """, (job_id,))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Job Posting Not Found")

        return {
            'job_id': row[0],
            'employer_id': row[1],
            'title': row[2],
            'description': row[3],
            'location': row[4],
            'work_mode': row[5],
            'employment_type': row[6],
            'experience_required': row[7],
            'education_required': row[8],
            'salary': row[9],
            'start_date': row[10],
            'end_date': row[11],
            'status': row[12],
            'applicants': row[13],
            'created_at': row[14],
            'updated_at': row[15]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_job_postings():
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT job_id, employer_id, title, description, location, work_mode, employment_type,
            experience_required, education_required, salary, start_date, end_date, status, applicants, created_at, updated_at
            FROM job_postings
            ORDER BY created_at DESC
        """)

        rows = cur.fetchall()
        conn.commit()

        return [
            {
                'job_id': row[0],
                'employer_id': row[1],
                'title': row[2],
                'description': row[3],
                'location': row[4],
                'work_mode': row[5],
                'employment_type': row[6],
                'experience_required': row[7],
                'education_required': row[8],
                'salary': row[9],
                'start_date': row[10],
                'end_date': row[11],
                'status': row[12],
                'applicants': row[13],
                'created_at': row[14],
                'updated_at': row[15]
            }
            for row in rows
        ]

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def update_job_posting(job_id: int, **kwargs):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        fields = []
        values = []

        for key, value in kwargs.items():
            if value is not None:
                fields.append(f"{key} = %s")
                values.append(value)

        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        values.append(job_id)
        query = f"UPDATE job_postings SET {', '.join(fields)} WHERE job_id = %s RETURNING job_id, employer_id, title, description, location, work_mode, employment_type, experience_required, education_required, salary, start_date, end_date, status, applicants, created_at, updated_at"

        cur.execute(query, values)
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Job Posting Not Found")

        return {
            'job_id': row[0],
            'employer_id': row[1],
            'title': row[2],
            'description': row[3],
            'location': row[4],
            'work_mode': row[5],
            'employment_type': row[6],
            'experience_required': row[7],
            'education_required': row[8],
            'salary': row[9],
            'start_date': row[10],
            'end_date': row[11],
            'status': row[12],
            'applicants': row[13],
            'created_at': row[14],
            'updated_at': row[15]
        }

    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def delete_job_posting(job_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM job_postings WHERE job_id = %s RETURNING job_id", (job_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Job Posting Not Found")

        return {"message": "Job posting deleted successfully"}

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)
