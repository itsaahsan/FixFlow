from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from ..database import get_db
from ..models import Property, Unit, MaintenanceRequest, User
from ..auth import get_current_user

router = APIRouter(prefix="/api/properties", tags=["properties"])

@router.get("")
def list_props(db: Session = Depends(get_db), current = Depends(get_current_user)):
    props = db.query(Property).all()
    out=[]
    for p in props:
        units = db.query(Unit).filter(Unit.property_id==p.id).all()
        open_req = db.query(MaintenanceRequest).filter(MaintenanceRequest.property_id==p.id, MaintenanceRequest.status!="Completed").count()
        monthly = db.query(func.coalesce(func.sum(MaintenanceRequest.cost),0)).filter(MaintenanceRequest.property_id==p.id).scalar() or 0
        out.append({
            "id":p.id,"name":p.name,"address":p.address,"city":p.city,"image":p.image,"units_count":p.units_count,
            "occupancy": len([u for u in units if u.tenant_id]),
            "open_requests": open_req,
            "monthly_cost": float(monthly),
            "units": [{"id":u.id,"unit_number":u.unit_number,"tenant_id":u.tenant_id,"rent":u.rent} for u in units]
        })
    return out

@router.get("/{pid}")
def get_prop(pid:int, db: Session = Depends(get_db), current = Depends(get_current_user)):
    p = db.query(Property).filter(Property.id==pid).first()
    if not p: return {"error":"not found"}
    units = db.query(Unit).filter(Unit.property_id==pid).all()
    reqs = db.query(MaintenanceRequest).filter(MaintenanceRequest.property_id==pid).order_by(MaintenanceRequest.created_at.desc()).all()
    # tenants
    tenant_ids = [u.tenant_id for u in units if u.tenant_id]
    tenants = db.query(User).filter(User.id.in_(tenant_ids)).all() if tenant_ids else []
    # costs
    total = sum([r.cost or 0 for r in reqs])
    # recurring
    from collections import Counter
    cats = Counter([r.category for r in reqs])
    return {
        "id":p.id,"name":p.name,"address":p.address,"image":p.image,"units_count":p.units_count,
        "units":[{"id":u.id,"unit_number":u.unit_number,"tenant": next((t.full_name for t in tenants if t.id==u.tenant_id),None)} for u in units],
        "tenants":[{"id":t.id,"name":t.full_name,"email":t.email} for t in tenants],
        "maintenance": [{"ticket_id":r.ticket_id,"title":r.title,"status":r.status,"priority":r.priority,"cost":r.cost,"created_at":r.created_at} for r in reqs],
        "total_cost": total,
        "category_breakdown": dict(cats)
    }
