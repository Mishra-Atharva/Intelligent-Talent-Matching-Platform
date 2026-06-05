"""
    Author: Atharva 
"""

import os
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


class Authenticator:

    def __init__(self):
        
        # Loading env variables
        load_dotenv()

        self.time_limit = int(os.getenv("JWT_EXPIRE_MINUTES", 60))
        self.secret = os.getenv("JWT_SECRET")

    # Hash the plain password
    def hash_password(self, plain: str) -> str:
        return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

    # Verify if the entered password matches the stored hash_password
    def verify_password(self, plain: str, hashed: str) -> bool:
        return bcrypt.checkpw(plain.encode(), hashed.encode())

    # Create the token
    def create_token(self, payload: dict) -> str:

        payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=self.time_limit)
        
        return jwt.encode(payload, self.secret, algorithm="HS256")
    
    # For protecting the api routes
    def get_current_user(self, creds: HTTPAuthorizationCredentials = Depends(HTTPBearer())):

        token = creds.credentials

        try:
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return payload['user_id']

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")

        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid Token")

    def verify_token(self, token):

        try: 
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return payload['user_id']
        
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")

        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid Token")