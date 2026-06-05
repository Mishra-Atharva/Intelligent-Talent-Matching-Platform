"""
    Author: Atharva
"""

from db import db
from fastapi import HTTPException
import psycopg2

def create_alert(user_id: int, message: str, status: str = "Unread"):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO alerts (user_id, message, status)
            VALUES (%s, %s, %s)
            RETURNING alert_id, user_id, message, status, created_at
        """, (user_id, message, status))

        row = cur.fetchone()
        conn.commit()

        return {
            'alert_id': row[0],
            'user_id': row[1],
            'message': row[2],
            'status': row[3],
            'created_at': row[4]
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

def get_alert(alert_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT alert_id, user_id, message, status, created_at FROM alerts WHERE alert_id = %s", (alert_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Alert Not Found")

        return {
            'alert_id': row[0],
            'user_id': row[1],
            'message': row[2],
            'status': row[3],
            'created_at': row[4]
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def get_user_alerts(user_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT alert_id, user_id, message, status, created_at FROM alerts WHERE user_id = %s", (user_id,))
        rows = cur.fetchall()
        conn.commit()

        alerts = []
        for row in rows:
            alerts.append({
                'alert_id': row[0],
                'user_id': row[1],
                'message': row[2],
                'status': row[3],
                'created_at': row[4]
            })

        return alerts

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def update_alert(alert_id: int, status: str):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE alerts SET status = %s WHERE alert_id = %s
            RETURNING alert_id, user_id, message, status, created_at
        """, (status, alert_id))

        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Alert Not Found")

        return {
            'alert_id': row[0],
            'user_id': row[1],
            'message': row[2],
            'status': row[3],
            'created_at': row[4]
        }

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)

def delete_alert(alert_id: int):
    conn = db.get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM alerts WHERE alert_id = %s RETURNING alert_id", (alert_id,))
        row = cur.fetchone()
        conn.commit()

        if not row:
            raise HTTPException(status_code=404, detail="Alert Not Found")

        return {"message": "Alert deleted successfully"}

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        db.release_conn(conn)
