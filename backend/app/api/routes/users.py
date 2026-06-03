from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserRegisterRequest, UserResponse
from app.core.security import get_current_user, get_admin_user
from app.models.user import User
from app.models.profile import UserProfile

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Create or update user record after Firebase auth."""
    try:
        existing = db.query(User).filter(User.firebase_uid == request.firebase_uid).first()

        if existing:
            if request.full_name and not existing.full_name:
                existing.full_name = request.full_name
                db.commit()
                db.refresh(existing)
            return UserResponse(
                id=existing.id,
                email=existing.email,
                full_name=existing.full_name,
                is_admin=existing.is_admin,
            )

        user = User(
            firebase_uid=request.firebase_uid,
            email=request.email,
            full_name=request.full_name,
            is_admin=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_admin=user.is_admin,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.get("/me")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return current user profile."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_admin": current_user.is_admin,
        },
        "profile": {
            "id": profile.id,
            "education": profile.education,
            "skills": profile.skills,
            "interests": profile.interests,
            "intake_completed": profile.intake_completed,
        } if profile else None
    }


@router.get("/admin/all")
async def get_all_users(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Return all users (admin only)."""
    users = db.query(User).order_by(User.created_at.desc()).all()

    result = []
    for u in users:
        profile = db.query(UserProfile).filter(UserProfile.user_id == u.id).first()
        result.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin,
            "created_at": str(u.created_at),
            "intake_completed": profile.intake_completed if profile else False,
        })

    return result
