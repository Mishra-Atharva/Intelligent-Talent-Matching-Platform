"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2



# Registering new users
def reg_user(email: str, password: str, first_name: str, last_name: str):
    conn = db.get_conn()
    cur = conn.cursor()

    password = db.authenticator.hash_password(password)
    user_type = 'Employer' if not last_name else 'Candidate'

    try:
        cur.execute(
            """
            INSERT INTO users (email, password, type, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING user_id, email, type, first_name, last_name, premium
            """,
            (email, password, user_type, first_name, last_name),
        )

        row = cur.fetchone()
        conn.commit()

        payload = {
            'user_id': row[0],
            'email': row[1],
            'type': row[2],
            'first_name': row[3],
            'last_name': row[4]
        }

        token = db.authenticator.create_token(payload)

        return {
            'user_id': row[0],
            'email': row[1],
            'first_name': row[3],
            'last_name': row[4],
            'type': row[2],
            'premium': row[5],
            'token': token
        }
    
    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        print("ERROR TYPE:", type(e))
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.UniqueViolation):
            raise HTTPException(status_code=409, detail="User Already Exists")

        if isinstance(e, psycopg2.errors.DataError):
            raise HTTPException(status_code=422, detail="Invalid Data Format")

        if isinstance(e, psycopg2.errors.OperationalError):
            raise HTTPException(status_code=503, detail="Database unavailable")

        if isinstance(e, psycopg2.errors.ProgrammingError):
            raise HTTPException(status_code=500, detail="Internal Server Error")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

# Check if user exists and return an session token
def auth_user(email: str, password: str):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT user_id, type, first_name, last_name, password, premium FROM users WHERE email = %s", (email,))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        authenticated = db.authenticator.verify_password(plain=password, hashed=row[4])

        if authenticated:
            payload = {
                'user_id': row[0],
                'email': email,
                'type': row[1],
                'first_name': row[2],
                'last_name': row[3]
            }
            token = db.authenticator.create_token(payload)
            return {
                'user_id': row[0],
                'email': email,
                'first_name': row[2],
                'last_name': row[3],
                'type': row[1],
                'premium': row[5],
                'token': token
            }

        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        print("ERROR TYPE:", type(e))
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.DataError):
            raise HTTPException(status_code=422, detail="Invalid Data Format")

        if isinstance(e, psycopg2.errors.OperationalError):
            raise HTTPException(status_code=503, detail="Database unavailable")

        if isinstance(e, psycopg2.errors.ProgrammingError):
            raise HTTPException(status_code=500, detail="Internal Server Error")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)