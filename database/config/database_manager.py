"""
    Author: Atharva
"""

import os
import requests
from config.authenticator import Authenticator
from psycopg2 import pool, OperationalError
from typing import Literal
from dotenv import load_dotenv


class Database:

    def __init__(self):
        load_dotenv()

        self.host = os.getenv("DB_HOST")
        self.port = os.getenv("DB_PORT")
        self.dbname = os.getenv("DB_NAME")
        self.user = os.getenv("DB_USER")
        self.password = os.getenv("DB_PASSWORD")

        self.fname = os.getenv("NAME")
        self.a_user = os.getenv("EMAIL")
        self.a_pass = os.getenv("PASSWORD")

        self.api_base_url = os.getenv("API_BASE_URL", "http://localhost:8000")

        self.authenticator = Authenticator()
        self.config_dir = "./config/sql/"
        self.conn = None

        self.connect()

    def connect(self) -> bool:
        try:
            wire = pool.ThreadedConnectionPool(
                minconn=1,
                maxconn=10,
                host=self.host,
                port=self.port,
                dbname=self.dbname,
                user=self.user,
                password=self.password
            )

            self.conn = wire
            print("[*] Connected to the Database!")
            return True

        except OperationalError as e:
            print(f"Could not connect: {e}")
            return False

        except Exception as e:
            print(f"Unexpected error: {e}")
            return False

    def register_admin(self, data: dict):
        return requests.post(f"{self.api_base_url}/api/user/register", json=data)

    def create_admin(self):
        
        # Checking if admin account has already been setup
        try: 
            conn = self.get_conn()
            cur = conn.cursor()

            cur.execute("SELECT user_id FROM users WHERE email = %s", (self.a_user,))
            if (cur.fetchone()):
                print("[*] Admin account already setup.")
                return

        except Exception as e:
            conn.rollback()
            print(f"[!] Error checking admin account: {e}")
            raise e 
        finally:
            cur.close()
            self.release_conn(conn)

        # If admin account doesn't already exist then create admin account
        data = {
            "first_name": self.fname,
            "last_name": self.lname,
            "email": self.a_user,
            "password": self.a_pass
        }

        try:
            signin = self.register_admin(data)

            if signin.status_code == 201:
                auth = signin.json()["token"]
                print("[*] Admin user created successfully!")

            else:
                raise Exception(f"Admin setup failed: {signin.status_code} {signin.text}")

        except requests.exceptions.ConnectionError:
            print("[!] Server is down!")

        except Exception as e:
            print(f"[!] Error: {e}")

    def setup_database(self, type: Literal["setup", "clean"] = "setup") -> None:
        conn = self.get_conn()
        cur = conn.cursor()
        file = f"{self.config_dir}dbcreate.sql" if type.lower() == "setup" else f"{self.config_dir}dbdrop.sql"

        try:
            with open(file, "r") as f:
                sql = f.read()

            cur.execute(sql)
            conn.commit()
            print(f"[*] Executed {type} query successfully!")
            print(f"[*] Changes committed successfully!")

            if type.lower() == "setup":
                load_file = f"{self.config_dir}dbload.sql"
                try:
                    with open(load_file, "r") as lf:
                        load_sql = lf.read()
                    cur.execute(load_sql)
                    conn.commit()
                    print("[*] Executed dbload.sql successfully!")
                except FileNotFoundError:
                    print("[*] dbload.sql not found, skipping data load.")
                except Exception as e:
                    conn.rollback()
                    print("[!] Error occurred while executing dbload.sql, rolled back!")
                    raise e

        except Exception as e:
            conn.rollback()
            print(f"[!] Error occurred executing rollback: {e}")
            raise e

        finally:
            cur.close()
            self.release_conn(conn)

    def get_conn(self):
        return self.conn.getconn()

    def release_conn(self, _conn):
        self.conn.putconn(_conn)


if __name__ == "__main__":
    pass
