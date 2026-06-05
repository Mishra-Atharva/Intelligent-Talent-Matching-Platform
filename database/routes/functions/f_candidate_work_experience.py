"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2
from datetime import date

def create_work_experience(user_id: int, company: str, role: str, start_date: date, end_date: date = None):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO candidate_work_experience (user_id, company, role, start_date, end_date)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING experience_id, user_id, company, role, start_date, end_date
        """, (user_id, company, role, start_date, end_date))

        row = cur.fetchone()
        conn.commit()

        return {
            'experience_id': row[0],
            'user_id': row[1],
            'company': row[2],
            'role': row[3],
            'start_date': row[4],
            'end_date': row[5]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.ForeignKeyViolation):
            raise HTTPException(status_code=422, detail="Invalid user_id")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_work_experience(experience_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT experience_id, user_id, company, role, start_date, end_date
            FROM candidate_work_experience WHERE experience_id = %s
        """, (experience_id,))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Experience Not Found")

        return {
            'experience_id': row[0],
            'user_id': row[1],
            'company': row[2],
            'role': row[3],
            'start_date': row[4],
            'end_date': row[5]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def update_work_experience(experience_id: int, **kwargs):
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

        values.append(experience_id)
        query = f"UPDATE candidate_work_experience SET {', '.join(fields)} WHERE experience_id = %s RETURNING experience_id, user_id, company, role, start_date, end_date"

        cur.execute(query, values)
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Experience Not Found")

        return {
            'experience_id': row[0],
            'user_id': row[1],
            'company': row[2],
            'role': row[3],
            'start_date': row[4],
            'end_date': row[5]
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

def delete_work_experience(experience_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM candidate_work_experience WHERE experience_id = %s RETURNING experience_id", (experience_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Experience Not Found")

        return {"message": "Experience deleted successfully"}

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)
