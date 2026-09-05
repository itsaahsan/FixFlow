from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .models import User
from .seed import seed_db
from .routers import auth as auth_router, maintenance as maint_router, properties as prop_router, technicians as tech_router, analytics as anal_router, ai as ai_router

app = FastAPI(title="FixFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables
Base.metadata.create_all(bind=engine)

# seed
try:
    db = SessionLocal()
    seed_db(db)
    db.close()
except Exception as e:
    print("seed error:", e)

app.include_router(auth_router.router)
app.include_router(ai_router.router)
app.include_router(maint_router.router)
app.include_router(prop_router.router)
app.include_router(tech_router.router)
app.include_router(anal_router.router)

@app.get("/api/health")
def health():
    return {"status":"ok","service":"FixFlow API"}

@app.get("/")
def root():
    return {"message":"FixFlow API running","docs":"/docs"}

@app.post("/api/seed")
def reseed():
    db = SessionLocal()
    # clear? just seed if empty else force
    from .models import MaintenanceRequest, MaintenanceNote, MaintenanceEvent, Notification, Unit, Property
    # if already seeded, clear and reseed for demo reset
    try:
        db.query(MaintenanceEvent).delete()
        db.query(MaintenanceNote).delete()
        db.query(Notification).delete()
        db.query(MaintenanceRequest).delete()
        db.query(Unit).delete()
        db.query(Property).delete()
        db.query(User).delete()
        db.commit()
        result = seed_db(db)
        return result
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()
