from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from ..database import get_db
from ..models import MaintenanceRequest, MaintenanceNote, MaintenanceEvent, User, Notification
from ..schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut, NoteCreate
from ..auth import get_current_user
from ..ai_service import analyze_maintenance
from datetime import datetime, timezone
import random

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])

def gen_ticket(db):
    # find max
    last = db.query(MaintenanceRequest).order_by(MaintenanceRequest.id.desc()).first()
    num = 1048
    if last and last.ticket_id.startswith("FF-"):
        try:
            num = int(last.ticket_id.split("-")[1]) + 1
        except: pass
    else:
        num = random.randint(1050, 9999)
    return f"FF-{num}"

@router.get("", response_model=List[MaintenanceOut])
def list_maintenance(
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    property_id: Optional[int] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db),
    current = Depends(get_current_user)
):
    q = db.query(MaintenanceRequest).options(joinedload(MaintenanceRequest.tenant), joinedload(MaintenanceRequest.technician), joinedload(MaintenanceRequest.notes).joinedload(MaintenanceNote.author), joinedload(MaintenanceRequest.events))
    # role filtering
    if current.role == "tenant":
        q = q.filter(MaintenanceRequest.tenant_id == current.id)
    elif current.role == "technician":
        # see assigned only? but allow all for demo? Filter assigned
        # keep all but prioritize assigned: show assigned + reported?
        pass

    if search:
        s = f"%{search.lower()}%"
        # need ilike
        q = q.filter(
            (MaintenanceRequest.ticket_id.ilike(s)) |
            (MaintenanceRequest.title.ilike(s)) |
            (MaintenanceRequest.description.ilike(s))
        )
    if status: q = q.filter(MaintenanceRequest.status == status)
    if priority: q = q.filter(MaintenanceRequest.priority == priority)
    if category: q = q.filter(MaintenanceRequest.category == category)
    if property_id: q = q.filter(MaintenanceRequest.property_id == property_id)

    if sort == "oldest":
        q = q.order_by(MaintenanceRequest.created_at.asc())
    elif sort == "priority":
        # custom order critical > high > medium > low
        q = q.order_by(MaintenanceRequest.created_at.desc())
        # we'll sort in python
    elif sort == "cost":
        q = q.order_by(MaintenanceRequest.cost.desc().nullslast())
    else:
        q = q.order_by(MaintenanceRequest.created_at.desc())

    results = q.all()
    if sort == "priority":
        order = {"Critical":0,"High":1,"Medium":2,"Low":3}
        results = sorted(results, key=lambda x: order.get(x.priority, 4))
    return results

@router.post("", response_model=MaintenanceOut)
def create_maintenance(payload: MaintenanceCreate, db: Session = Depends(get_db), current = Depends(get_current_user)):
    # analyze
    analysis = analyze_maintenance(payload.description)
    # determine property/unit: use provided or default to tenant's unit
    prop_id = payload.property_id
    unit_id = payload.unit_id
    if not prop_id:
        # try to find unit for tenant
        from ..models import Unit
        unit = db.query(Unit).filter(Unit.tenant_id == current.id).first()
        if unit:
            prop_id = unit.property_id
            unit_id = unit.id
        else:
            # fallback first property
            from ..models import Property
            prop = db.query(Property).first()
            prop_id = prop.id if prop else 1
    title = payload.title or analysis["issue"] or payload.description[:40]
    ticket = gen_ticket(db)
    req = MaintenanceRequest(
        ticket_id=ticket,
        tenant_id=current.id,
        property_id=prop_id,
        unit_id=unit_id,
        category=analysis["category"],
        priority=analysis["priority"],
        status="Reported",
        title=title,
        description=payload.description,
        location=payload.location or "Unit",
        image_url=payload.image_url,
        ai_category=analysis["category"],
        ai_priority=analysis["priority"],
        ai_issue=analysis["issue"],
        ai_action=analysis["action"],
        ai_response=analysis["response"],
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    # event
    ev = MaintenanceEvent(request_id=req.id, status="Reported", actor_id=current.id)
    db.add(ev)
    # notify manager
    managers = db.query(User).filter(User.role=="manager").all()
    for m in managers:
        db.add(Notification(user_id=m.id, title="New maintenance request", message=f"{current.full_name} reported: {title} ({analysis['priority']} priority) — {ticket}"))
    db.commit()
    db.refresh(req)
    # eager load
    req = db.query(MaintenanceRequest).options(joinedload(MaintenanceRequest.tenant), joinedload(MaintenanceRequest.technician), joinedload(MaintenanceRequest.notes), joinedload(MaintenanceRequest.events)).filter(MaintenanceRequest.id==req.id).first()
    return req

@router.get("/{req_id}", response_model=MaintenanceOut)
def get_one(req_id: int, db: Session = Depends(get_db), current = Depends(get_current_user)):
    req = db.query(MaintenanceRequest).options(joinedload(MaintenanceRequest.tenant), joinedload(MaintenanceRequest.technician), joinedload(MaintenanceRequest.notes).joinedload(MaintenanceNote.author), joinedload(MaintenanceRequest.events)).filter(MaintenanceRequest.id==req_id).first()
    if not req: raise HTTPException(404, "Not found")
    if current.role=="tenant" and req.tenant_id != current.id and current.role!="manager":
        # tenants can only see own?
        # allow if tenant?
        raise HTTPException(403,"Forbidden")
    return req

@router.patch("/{req_id}", response_model=MaintenanceOut)
def update_req(req_id:int, payload: MaintenanceUpdate, db: Session = Depends(get_db), current = Depends(get_current_user)):
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id==req_id).first()
    if not req: raise HTTPException(404,"Not found")
    # auth: manager or technician assigned
    if current.role not in ["manager","technician"]:
        raise HTTPException(403,"Only manager/technician can update")
    changed=False
    if payload.status:
        req.status = payload.status
        ev = MaintenanceEvent(request_id=req.id, status=payload.status, actor_id=current.id)
        db.add(ev)
        # notify tenant
        db.add(Notification(user_id=req.tenant_id, title="Status update", message=f"Your request {req.ticket_id} is now {payload.status}"))
        if payload.status=="Completed":
            # notify manager
            mgrs=db.query(User).filter(User.role=="manager").all()
            for m in mgrs:
                db.add(Notification(user_id=m.id, title="Repair completed", message=f"{req.ticket_id} marked completed by {current.full_name}"))
        changed=True
    if payload.technician_id is not None:
        req.technician_id = payload.technician_id
        req.status = "Assigned" if req.status=="Reported" else req.status
        ev = MaintenanceEvent(request_id=req.id, status="Assigned", actor_id=current.id)
        db.add(ev)
        db.add(Notification(user_id=payload.technician_id, title="New job assigned", message=f"You've been assigned {req.ticket_id}: {req.title}"))
        db.add(Notification(user_id=req.tenant_id, title="Technician assigned", message=f"A technician has been assigned to {req.ticket_id}"))
        changed=True
    if payload.cost is not None:
        req.cost = payload.cost
        changed=True
    if payload.priority: req.priority = payload.priority; changed=True
    if payload.category: req.category = payload.category; changed=True
    if changed:
        req.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(req)
    req = db.query(MaintenanceRequest).options(joinedload(MaintenanceRequest.tenant), joinedload(MaintenanceRequest.technician), joinedload(MaintenanceRequest.notes).joinedload(MaintenanceNote.author), joinedload(MaintenanceRequest.events)).filter(MaintenanceRequest.id==req_id).first()
    return req

@router.post("/{req_id}/assign")
def assign(req_id:int, body: dict, db: Session = Depends(get_db), current = Depends(get_current_user)):
    if current.role!="manager":
        raise HTTPException(403,"Only manager")
    tech_id = body.get("technician_id")
    if not tech_id: raise HTTPException(400,"technician_id required")
    return update_req(req_id, MaintenanceUpdate(technician_id=tech_id), db, current)

@router.post("/{req_id}/notes", response_model=MaintenanceOut)
def add_note(req_id:int, payload: NoteCreate, db: Session = Depends(get_db), current = Depends(get_current_user)):
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id==req_id).first()
    if not req: raise HTTPException(404,"Not found")
    note = MaintenanceNote(request_id=req.id, author_id=current.id, content=payload.content)
    db.add(note)
    db.commit()
    return get_one(req_id, db, current)

@router.post("/{req_id}/complete", response_model=MaintenanceOut)
def complete(req_id:int, body: dict, db: Session = Depends(get_db), current = Depends(get_current_user)):
    cost = body.get("cost")
    notes = body.get("notes")
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id==req_id).first()
    if not req: raise HTTPException(404,"Not found")
    if notes:
        db.add(MaintenanceNote(request_id=req.id, author_id=current.id, content=notes))
    update = MaintenanceUpdate(status="Completed", cost=cost)
    return update_req(req_id, update, db, current)
