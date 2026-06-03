from pydantic import BaseModel
from typing import Optional


class UserRegisterRequest(BaseModel):
    firebase_uid: str
    email: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_admin: bool = False

    class Config:
        from_attributes = True
