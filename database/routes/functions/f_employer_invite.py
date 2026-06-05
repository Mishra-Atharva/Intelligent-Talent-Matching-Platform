"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2

def create_invite(employer_id: int, candidate_id: int, job_id: int = None, message: str = None, status: str = "Sent"):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO employer_invites (employer_id, candidate_id, job_id, message, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING invite_id, employer_id, candidate_id, job_id, message, status, sent_at
        """, (employer_id, candidate_id, job_id, message, status))

        row = cur.fetchone()
        conn.commit()

        return {
            'invite_id': row[0],
            'employer_id': row[1],
            'candidate_id': row[2],
            'job_id': row[3],
            'message': row[4],
            'status': row[5],
            'sent_at': row[6]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)

        if isinstance(e, psycopg2.errors.ForeignKeyViolation):
            raise HTTPException(status_code=422, detail="Invalid employer_id, candidate_id or job_id")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_invite(invite_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT invite_id, employer_id, candidate_id, job_id, message, status, sent_at
            FROM employer_invites WHERE invite_id = %s
        """, (invite_id,))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Invite Not Found")

        return {
            'invite_id': row[0],
            'employer_id': row[1],
            'candidate_id': row[2],
            'job_id': row[3],
            'message': row[4],
            'status': row[5],
            'sent_at': row[6]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def update_invite(invite_id: int, status: str):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE employer_invites SET status = %s WHERE invite_id = %s
            RETURNING invite_id, employer_id, candidate_id, job_id, message, status, sent_at
        """, (status, invite_id))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Invite Not Found")

        return {
            'invite_id': row[0],
            'employer_id': row[1],
            'candidate_id': row[2],
            'job_id': row[3],
            'message': row[4],
            'status': row[5],
            'sent_at': row[6]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def delete_invite(invite_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM employer_invites WHERE invite_id = %s RETURNING invite_id", (invite_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Invite Not Found")

        return {"message": "Invite deleted successfully"}

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)
