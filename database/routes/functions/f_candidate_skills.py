"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2

def add_skill(user_id: int, skill: str):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO candidate_skills (user_id, skill)
            VALUES (%s, %s)
            RETURNING skill_id, user_id, skill
        """, (user_id, skill))

        row = cur.fetchone()
        conn.commit()

        return {
            'skill_id': row[0],
            'user_id': row[1],
            'skill': row[2]
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

def get_skill(skill_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT skill_id, user_id, skill FROM candidate_skills WHERE skill_id = %s", (skill_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Skill Not Found")

        return {
            'skill_id': row[0],
            'user_id': row[1],
            'skill': row[2]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_user_skills(user_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT skill_id, user_id, skill FROM candidate_skills WHERE user_id = %s", (user_id,))
        rows = cur.fetchall()
        conn.commit()

        skills = []
        for row in rows:
            skills.append({
                'skill_id': row[0],
                'user_id': row[1],
                'skill': row[2]
            })

        return skills

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def delete_skill(skill_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM candidate_skills WHERE skill_id = %s RETURNING skill_id", (skill_id,))
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
