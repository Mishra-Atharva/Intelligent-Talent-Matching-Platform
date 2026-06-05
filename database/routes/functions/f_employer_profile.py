"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2

def create_employer_profile(user_id: int, company_name: str, industry: str = None, company_size: str = None,
                           location: str = None, website: str = None, established: str = None, description: str = None):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO employer_profiles (user_id, company_name, industry, company_size, location, website, established, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING profile_id, user_id, company_name, industry, company_size, location, website, established, description, updated_at
        """, (user_id, company_name, industry, company_size, location, website, established, description))

        row = cur.fetchone()
        conn.commit()

        return {
            'profile_id': row[0],
            'user_id': row[1],
            'company_name': row[2],
            'industry': row[3],
            'company_size': row[4],
            'location': row[5],
            'website': row[6],
            'established': row[7],
            'description': row[8],
            'updated_at': row[9]
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

def get_employer_profile(profile_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT profile_id, user_id, company_name, industry, company_size, location, website, established, description, updated_at
            FROM employer_profiles WHERE profile_id = %s
        """, (profile_id,))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Profile Not Found")

        return {
            'profile_id': row[0],
            'user_id': row[1],
            'company_name': row[2],
            'industry': row[3],
            'company_size': row[4],
            'location': row[5],
            'website': row[6],
            'established': row[7],
            'description': row[8],
            'updated_at': row[9]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def update_employer_profile(profile_id: int, **kwargs):
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
        query = f"UPDATE employer_profiles SET {', '.join(fields)} WHERE profile_id = %s RETURNING profile_id, user_id, company_name, industry, company_size, location, website, established, description, updated_at"

        cur.execute(query, values)
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Profile Not Found")

        return {
            'profile_id': row[0],
            'user_id': row[1],
            'company_name': row[2],
            'industry': row[3],
            'company_size': row[4],
            'location': row[5],
            'website': row[6],
            'established': row[7],
            'description': row[8],
            'updated_at': row[9]
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

def delete_employer_profile(profile_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM employer_profiles WHERE profile_id = %s RETURNING profile_id", (profile_id,))
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
