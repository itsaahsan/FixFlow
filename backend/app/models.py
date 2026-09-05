from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base
import enum

class UserRole(str, enum.Enum):
    manager = "manager"
    tenant = "tenant"
    technician = "technician"

class TicketStatus(str, enum.Enum):
    reported = "Reported"
    analyzing = "Analyzing"
    assigned = "Assigned"
    scheduled = "Scheduled"
    in_progress = "In Progress"
    completed = "Completed"

class Priority(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"

class Category(str, enum.Enum):
    plumbing = "Plumbing"
    electrical = "Electrical"
    hvac = "HVAC"
    appliance = "Appliance"
    structural = "Structural"
    internet = "Internet"
    other = "Other"

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # manager/tenant/technician
    avatar = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    specialty = Column(String, nullable=True)  # for technician
    created_at = Column(DateTime, default=utcnow)

    maintenance_requests = relationship("MaintenanceRequest", back_populates="tenant", foreign_keys="MaintenanceRequest.tenant_id")
    assigned_tickets = relationship("MaintenanceRequest", back_populates="technician", foreign_keys="MaintenanceRequest.technician_id")

class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, default="San Francisco")
    image = Column(String, nullable=True)
    units_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)
    units = relationship("Unit", back_populates="property", cascade="all, delete-orphan")

class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    unit_number = Column(String, nullable=False)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    rent = Column(Float, default=1800)
    bedrooms = Column(Integer, default=2)
    bathrooms = Column(Integer, default=1)

    property = relationship("Property", back_populates="units")
    tenant = relationship("User", foreign_keys=[tenant_id])

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"
    id = Column(Integer, primary_key=True)
    ticket_id = Column(String, unique=True, index=True)  # FF-1001
    tenant_id = Column(Integer, ForeignKey("users.id"))
    property_id = Column(Integer, ForeignKey("properties.id"))
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category = Column(String, default="Other")
    priority = Column(String, default="Medium")
    status = Column(String, default="Reported")
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    cost = Column(Float, nullable=True)
    ai_category = Column(String, nullable=True)
    ai_priority = Column(String, nullable=True)
    ai_issue = Column(String, nullable=True)
    ai_action = Column(String, nullable=True)
    ai_response = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    tenant = relationship("User", back_populates="maintenance_requests", foreign_keys=[tenant_id])
    technician = relationship("User", back_populates="assigned_tickets", foreign_keys=[technician_id])
    property = relationship("Property")
    unit = relationship("Unit")
    notes = relationship("MaintenanceNote", back_populates="request", cascade="all, delete-orphan")
    events = relationship("MaintenanceEvent", back_populates="request", cascade="all, delete-orphan")

class MaintenanceNote(Base):
    __tablename__ = "maintenance_notes"
    id = Column(Integer, primary_key=True)
    request_id = Column(Integer, ForeignKey("maintenance_requests.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)
    request = relationship("MaintenanceRequest", back_populates="notes")
    author = relationship("User")

class MaintenanceEvent(Base):
    __tablename__ = "maintenance_events"
    id = Column(Integer, primary_key=True)
    request_id = Column(Integer, ForeignKey("maintenance_requests.id"))
    status = Column(String, nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    request = relationship("MaintenanceRequest", back_populates="events")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
