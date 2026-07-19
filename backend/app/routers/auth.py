from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserResponse, UserUpdate, TokenResponse
from app.services.email_service import send_verification_email
from app.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    generate_verification_token,
    get_current_user,
)
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash password and create verification token
    hashed_pwd = hash_password(user_data.password)
    verification_token = generate_verification_token()

    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        name=user_data.name,
        is_verified=False,
        verification_token=verification_token,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email via Brevo asynchronously (simulated or real depending on configuration)
    await send_verification_email(
        to_email=new_user.email,
        name=new_user.name,
        token=verification_token,
    )

    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.strip().lower()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Generate JWT
    token = create_access_token(data={"sub": str(user.id)})

    # Set HTTP-only Cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24 * 7, # 7 days
        expires=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False, # Set to True in production with HTTPS
    )

    return {"access_token": token, "user": user}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", samesite="lax")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/confirm/{token}")
async def confirm_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        # Redirect to confirm page with success=false
        return RedirectResponse(url=f"{settings.frontend_url}/confirm?success=false")

    if user.pending_email:
        user.email = user.pending_email
        user.pending_email = None
    user.is_verified = True
    user.verification_token = None
    db.commit()

    # Redirect to confirm page with success=true
    return RedirectResponse(url=f"{settings.frontend_url}/confirm?success=true")

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Update name if provided
    if profile_data.name is not None:
        current_user.name = profile_data.name.strip()

    # Update email if provided and different
    if profile_data.email is not None:
        new_email = profile_data.email.strip().lower()
        if new_email != current_user.email:
            # Check if email is already taken by someone else (as primary or pending)
            existing_user = db.query(User).filter(
                or_(User.email == new_email, User.pending_email == new_email)
            ).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use",
                )
            
            # Reset verification status and send new code to the pending email
            current_user.pending_email = new_email
            new_token = generate_verification_token()
            current_user.verification_token = new_token
            
            await send_verification_email(
                to_email=new_email,
                name=current_user.name,
                token=new_token,
            )

    # Update password if provided
    if profile_data.password is not None and profile_data.password.strip():
        current_user.hashed_password = hash_password(profile_data.password)

    db.commit()
    db.refresh(current_user)
    return current_user
