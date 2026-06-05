"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2

def create_candidate_profile(user_id: int, first_name: str, last_name: str = None, age: int = None,
                            phone: str = None, location: str = None, education_level: str = None,
                            major: str = None, university: str = None, graduation_year: str = None,
                            years_of_experience: str = None, preferred_work_mode: str = None,
                            preferred_location: str = None, summary: str = None):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO candidate_profiles (user_id, first_name, last_name, age, phone, location,
            education_level, major, university, graduation_year, years_of_experience,
            preferred_work_mode, preferred_location, summary)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING profile_id, user_id, first_name, last_name, age, phone, location,
            education_level, major, university, graduation_year, years_of_experience,
            preferred_work_mode, preferred_location, summary, updated_at
        """, (user_id, first_name, last_name, age, phone, location, education_level, major,
              university, graduation_year, years_of_experience, preferred_work_mode,
              preferred_location, summary))

        row = cur.fetchone()
        conn.commit()

        return {
            'profile_id': row[0],
            'user_id': row[1],
            'first_name': row[2],
            'last_name': row[3],
            'age': row[4],
            'phone': row[5],
            'location': row[6],
            'education_level': row[7],
            'major': row[8],
            'university': row[9],
            'graduation_year': row[10],
            'years_of_experience': row[11],
            'preferred_work_mode': row[12],
            'preferred_location': row[13],
            'summary': row[14],
            'updated_at': row[15]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.UniqueViolation):
            raise HTTPException(status_code=409, detail="Profile Already Exists")
        if isinstance(e, psycopg2.errors.ForeignKeyViolation):
            raise HTTPException(status_code=422, detail="Invalid user_id")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_candidate_profile(profile_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT profile_id, user_id, first_name, last_name, age, phone, location,
            education_level, major, university, graduation_year, years_of_experience,
            preferred_work_mode, preferred_location, summary, updated_at
            FROM candidate_profiles WHERE profile_id = %s
        """, (profile_id,))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Profile Not Found")

        return {
            'profile_id': row[0],
            'user_id': row[1],
            'first_name': row[2],
            'last_name': row[3],
            'age': row[4],
            'phone': row[5],
            'location': row[6],
            'education_level': row[7],
            'major': row[8],
            'university': row[9],
            'graduation_year': row[10],
            'years_of_experience': row[11],
            'preferred_work_mode': row[12],
            'preferred_location': row[13],
            'summary': row[14],
            'updated_at': row[15]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def update_candidate_profile(profile_id: int, **kwargs):
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

        values.append(profile_id)
        query = f"UPDATE candidate_profiles SET {', '.join(fields)} WHERE profile_id = %s RETURNING profile_id, user_id, first_name, last_name, age, phone, location, education_level, major, university, graduation_year, years_of_experience, preferred_work_mode, preferred_location, summary, updated_at"

        cur.execute(query, values)
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Profile Not Found")

        return {
            'profile_id': row[0],
            'user_id': row[1],
            'first_name': row[2],
            'last_name': row[3],
            'age': row[4],
            'phone': row[5],
            'location': row[6],
            'education_level': row[7],
            'major': row[8],
            'university': row[9],
            'graduation_year': row[10],
            'years_of_experience': row[11],
            'preferred_work_mode': row[12],
            'preferred_location': row[13],
            'summary': row[14],
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

def delete_candidate_profile(profile_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM candidate_profiles WHERE profile_id = %s RETURNING profile_id", (profile_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Profile Not Found")

        return {"message": "Profile deleted successfully"}

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)
