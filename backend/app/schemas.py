from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    avatar: Optional[str] = None
    phone: Optional[str] = None
    specialty: Optional[str] = None
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class AIAnalysis(BaseModel):
    category: str
    issue: str
    priority: str
    action: str
    response: str
    is_mock: bool = True

class MaintenanceCreate(BaseModel):
    description: str
    location: Optional[str] = None
    property_id: Optional[int] = None
    unit_id: Optional[int] = None
    image_url: Optional[str] = None
    title: Optional[str] = None

class MaintenanceUpdate(BaseModel):
    status: Optional[str] = None
    technician_id: Optional[int] = None
    cost: Optional[float] = None
    priority: Optional[str] = None
    category: Optional[str] = None

class NoteCreate(BaseModel):
    content: str

class NoteOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: UserOut
    class Config:
        from_attributes = True

class EventOut(BaseModel):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class MaintenanceOut(BaseModel):
    id: int
    ticket_id: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    location: Optional[str]
    image_url: Optional[str]
    cost: Optional[float]
    ai_category: Optional[str]
    ai_priority: Optional[str]
    ai_issue: Optional[str]
    ai_action: Optional[str]
    ai_response: Optional[str]
    created_at: datetime
    updated_at: datetime
    tenant: Optional[UserOut] = None
    technician: Optional[UserOut] = None
    property_id: Optional[int]
    unit_id: Optional[int]
    notes: List[NoteOut] = []
    events: List[EventOut] = []
    class Config:
        from_attributes = True

class PropertyOut(BaseModel):
    id: int
    name: str
    address: str
    city: str
    image: Optional[str]
    units_count: int
    class Config:
        from_attributes = True

class AnalyticsOverview(BaseModel):
    total_properties: int
    active_requests: int
    high_priority: int
    monthly_spending: float
    avg_resolution_hours: float
    requests_by_status: dict
    requests_by_category: dict
    requests_by_property: dict
    insights: List[str]
    smart_alerts: List[dict]
    monthly_spending_trend: List[dict]
    resolution_trend: List[dict]

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    read: bool
    created_at: datetime
    class Config:
        from_attributes = True
