from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import get_current_user

router = APIRouter(prefix="/api/technicians", tags=["technicians"])

@router.get("")
def list_techs(db: Session = Depends(get_db), current=Depends(get_current_user)):
    techs = db.query(User).filter(User.role=="technician").all()
    return [{"id":t.id,"full_name":t.full_name,"email":t.email,"specialty":t.specialty,"phone":t.phone, "avatar":t.avatar} for t in techs]
