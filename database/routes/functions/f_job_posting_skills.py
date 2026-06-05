"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2

def add_job_skill(job_id: int, skill: str):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO job_posting_skills (job_id, skill)
            VALUES (%s, %s)
            RETURNING skill_id, job_id, skill
        """, (job_id, skill))

        row = cur.fetchone()
        conn.commit()

        return {
            'skill_id': row[0],
            'job_id': row[1],
            'skill': row[2]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.ForeignKeyViolation):
            raise HTTPException(status_code=422, detail="Invalid job_id")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_job_skill(skill_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT skill_id, job_id, skill FROM job_posting_skills WHERE skill_id = %s", (skill_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Skill Not Found")

        return {
            'skill_id': row[0],
            'job_id': row[1],
            'skill': row[2]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_job_skills(job_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT skill_id, job_id, skill FROM job_posting_skills WHERE job_id = %s", (job_id,))
        rows = cur.fetchall()
        conn.commit()

        skills = []
        for row in rows:
            skills.append({
                'skill_id': row[0],
                'job_id': row[1],
                'skill': row[2]
            })

        return skills

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def delete_job_skill(skill_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM job_posting_skills WHERE skill_id = %s RETURNING skill_id", (skill_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Skill Not Found")

        return {"message": "Skill deleted successfully"}

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)
