from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import Token, UserOut, LoginRequest
from ..auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def me(current = Depends(get_current_user)):
    return current

@router.get("/demo-accounts")
def demo_accounts(db: Session = Depends(get_db)):
    users = db.query(User).all()
    # group
    return [{"email":u.email,"role":u.role,"name":u.full_name,"password":"demo123"} for u in users if u.email.endswith("demo.com") or u.email.endswith("fixflow.demo")]
