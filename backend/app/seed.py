from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from .models import User, Property, Unit, MaintenanceRequest, MaintenanceNote, MaintenanceEvent, Notification
from .auth import hash_password
import random

def seed_db(db: Session):
    if db.query(User).count() > 0:
        return {"seeded": False, "msg": "already seeded"}

    # Users
    manager = User(email="manager@fixflow.demo", hashed_password=hash_password("demo123"), full_name="Jordan Taylor", role="manager", phone="415-555-0142")
    tenants_data = [
        ("Alex Morgan", "alex@demo.com"),
        ("Sofia Chen", "sofia@demo.com"),
        ("Marcus Lee", "marcus@demo.com"),
        ("Priya Patel", "priya@demo.com"),
        ("Elena Rodriguez", "elena@demo.com"),
        ("David Kim", "david@demo.com"),
        ("Aisha Johnson", "aisha@demo.com"),
        ("Ryan O'Connell", "ryan@demo.com"),
        ("Maya Singh", "maya@demo.com"),
        ("Chris Brown", "chris@demo.com"),
    ]
    tenants=[]
    for n,e in tenants_data:
        tenants.append(User(email=e, hashed_password=hash_password("demo123"), full_name=n, role="tenant"))

    techs_data = [
        ("Carlos Rivera", "carlos@fixflow.demo", "Plumbing", "415-555-0101"),
        ("Jen Park", "jen@fixflow.demo", "Electrical", "415-555-0102"),
        ("Mike Henderson", "mike@fixflow.demo", "HVAC", "415-555-0103"),
        ("Dana White", "dana@fixflow.demo", "General", "415-555-0104"),
        ("Samir Gupta", "samir@fixflow.demo", "Appliance", "415-555-0105"),
    ]
    techs=[]
    for n,e,s,p in techs_data:
        techs.append(User(email=e, hashed_password=hash_password("demo123"), full_name=n, role="technician", specialty=s, phone=p))

    db.add(manager)
    for t in tenants: db.add(t)
    for t in techs: db.add(t)
    db.commit()
    db.refresh(manager)
    for t in tenants: db.refresh(t)
    for t in techs: db.refresh(t)

    # Properties
    props = [
        Property(name="Sunrise Apartments", address="1242 Market Street, San Francisco, CA 94102", city="San Francisco", image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600", units_count=8),
        Property(name="Cedar Heights", address="88 Cedar Lane, Oakland, CA 94611", city="Oakland", image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600", units_count=6),
        Property(name="Harbor Lofts", address="221 Harbor Drive, San Francisco, CA 94105", city="San Francisco", image="https://images.unsplash.com/photo-1493809842364-78817add58d1?w=600", units_count=10),
        Property(name="Willow Court", address="45 Willow Ave, Berkeley, CA 94704", city="Berkeley", image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600", units_count=5),
    ]
    for p in props: db.add(p)
    db.commit()
    for p in props: db.refresh(p)

    # Units
    units=[]
    unit_tenant_map = [0,1,2,3,4,5,6,7, 8,9,0,1, 2,3,4,5,6,7,8,9, 0,1,2,3, 4,5,6,7,8]
    idx=0
    for prop in props:
        for i in range(prop.units_count):
            tenant = tenants[unit_tenant_map[idx % len(unit_tenant_map)]]
            u = Unit(property_id=prop.id, unit_number=f"{random.choice(['1','2','3','4'])}{random.choice(['A','B','C','D'])}{i+1}", tenant_id=tenant.id, rent=random.randint(1600,3400), bedrooms=random.choice([1,2,3]), bathrooms=random.choice([1,2]))
            db.add(u)
            units.append(u)
            idx+=1
    db.commit()
    for u in units: db.refresh(u)

    # Helper to find tenant/unit for sunrise
    sunrise = props[0]
    sunrise_units = [u for u in units if u.property_id==sunrise.id]
    alex = db.query(User).filter(User.email=="alex@demo.com").first()
    # ensure alex has a sunrise unit
    alex_unit = sunrise_units[0]
    alex_unit.tenant_id = alex.id
    db.commit()

    now = datetime.now(timezone.utc)
    def days_ago(d): return now - timedelta(days=d, hours=random.randint(0,12))

    requests_data = [
        # Sunrise recurring plumbing
        {"desc":"Water is leaking underneath the kitchen sink and the cabinet is getting wet. Pooling water noticed.", "cat":"Plumbing","pri":"High","status":"Reported","prop":sunrise,"unit":alex_unit,"tenant":alex,"days":0, "title":"Under-sink water leak", "cost":None},
        {"desc":"Bathroom sink is dripping constantly, water waste and sound at night.", "cat":"Plumbing","pri":"Medium","status":"Completed","prop":sunrise,"unit":sunrise_units[1],"tenant":tenants[1],"days":12, "title":"Bathroom faucet drip","cost":145},
        {"desc":"Toilet keeps running and water level not stopping.", "cat":"Plumbing","pri":"Medium","status":"Completed","prop":sunrise,"unit":sunrise_units[2],"tenant":tenants[2],"days":28, "title":"Running toilet","cost":180},
        {"desc":"Low water pressure in shower, barely any flow.", "cat":"Plumbing","pri":"Medium","status":"In Progress","prop":sunrise,"unit":sunrise_units[3],"tenant":tenants[3],"days":5, "title":"Low shower pressure","cost":220},
        {"desc":"Kitchen faucet handle loose and leaking at base.", "cat":"Plumbing","pri":"High","status":"Assigned","prop":props[1],"unit":units[10],"tenant":tenants[4],"days":2, "title":"Leaking faucet base","cost":95},
        # Electrical
        {"desc":"Living room outlet not working, no power for lamp.", "cat":"Electrical","pri":"Medium","status":"Completed","prop":props[2],"unit":units[16],"tenant":tenants[5],"days":18, "title":"Dead outlet","cost":210},
        {"desc":"Lights flickering in hallway intermittently.", "cat":"Electrical","pri":"High","status":"Scheduled","prop":props[1],"unit":units[9],"tenant":tenants[6],"days":3, "title":"Flickering lights","cost":None},
        {"desc":"Breaker keeps tripping when using microwave.", "cat":"Electrical","pri":"Critical","status":"In Progress","prop":props[2],"unit":units[17],"tenant":tenants[7],"days":1, "title":"Breaker tripping","cost":300},
        # HVAC
        {"desc":"AC not cooling, apartment stays warm even at 68 setting.", "cat":"HVAC","pri":"High","status":"Completed","prop":props[2],"unit":units[15],"tenant":tenants[8],"days":22, "title":"AC not cooling","cost":450},
        {"desc":"Heater making loud banging noise when starting.", "cat":"HVAC","pri":"Medium","status":"Completed","prop":props[0],"unit":sunrise_units[4],"tenant":tenants[9],"days":35, "title":"Heater banging noise","cost":320},
        {"desc":"Thermostat not responding, stuck at 72 degrees.", "cat":"HVAC","pri":"Medium","status":"Reported","prop":props[3],"unit":units[24],"tenant":tenants[0],"days":0, "title":"Thermostat stuck","cost":None},
        {"desc":"HVAC filter needs replacement, dusty vents.", "cat":"HVAC","pri":"Low","status":"Completed","prop":props[3],"unit":units[25],"tenant":tenants[1],"days":40, "title":"Filter replacement","cost":85},
        # Appliance
        {"desc":"Refrigerator not keeping food cold, freezer too warm.", "cat":"Appliance","pri":"High","status":"Completed","prop":props[1],"unit":units[11],"tenant":tenants[2],"days":15, "title":"Fridge not cooling","cost":380},
        {"desc":"Dishwasher not draining, standing water at bottom.", "cat":"Appliance","pri":"Medium","status":"Assigned","prop":props[2],"unit":units[18],"tenant":tenants[3],"days":4, "title":"Dishwasher drainage","cost":160},
        {"desc":"Washing machine leaking during spin cycle.", "cat":"Appliance","pri":"High","status":"Completed","prop":props[0],"unit":sunrise_units[5],"tenant":tenants[4],"days":20, "title":"Washer leak","cost":275},
        # Structural
        {"desc":"Crack appearing on bedroom ceiling, small plaster falling.", "cat":"Structural","pri":"High","status":"In Progress","prop":props[1],"unit":units[12],"tenant":tenants[5],"days":7, "title":"Ceiling crack","cost":600},
        {"desc":"Window not closing properly, draft coming in.", "cat":"Structural","pri":"Low","status":"Completed","prop":props[3],"unit":units[26],"tenant":tenants[6],"days":50, "title":"Drafty window","cost":120},
        # Internet
        {"desc":"WiFi keeps dropping every hour, router blinking red.", "cat":"Internet","pri":"Medium","status":"Completed","prop":props[2],"unit":units[19],"tenant":tenants[7],"days":10, "title":"WiFi dropping","cost":0},
        {"desc":"Internet very slow, can't stream or video call.", "cat":"Internet","pri":"Low","status":"Reported","prop":props[3],"unit":units[27],"tenant":tenants[8],"days":1, "title":"Slow internet","cost":None},
        {"desc":"Water stain on ceiling after rain, possible roof leak.", "cat":"Structural","pri":"Critical","status":"Reported","prop":props[0],"unit":sunrise_units[6],"tenant":tenants[9],"days":1, "title":"Ceiling water stain","cost":None},
    ]

    ticket_counter = 1042
    for rd in requests_data:
        ticket_counter+=1
        ticket_id = f"FF-{ticket_counter}"
        tenant = rd["tenant"]
        tech = None
        if rd["status"] in ["Assigned","Scheduled","In Progress","Completed"]:
            # assign based on category
            specialty_map = {"Plumbing":0, "Electrical":1, "HVAC":2, "Appliance":4, "Structural":3, "Internet":3, "Other":3}
            tech = techs[specialty_map.get(rd["cat"],3)]
        created = days_ago(rd["days"])
        ai = {"category":rd["cat"],"priority":rd["pri"],"issue":rd["title"],"action":"Schedule inspection with qualified technician.","response":"We'll have a technician review shortly."}
        req = MaintenanceRequest(
            ticket_id=ticket_id, tenant_id=tenant.id, property_id=rd["prop"].id, unit_id=rd["unit"].id, technician_id=tech.id if tech else None,
            category=rd["cat"], priority=rd["pri"], status=rd["status"], title=rd["title"], description=rd["desc"],
            location="Kitchen" if "sink" in rd["desc"].lower() or "kitchen" in rd["desc"].lower() else "Unit",
            cost=rd["cost"], ai_category=ai["category"], ai_priority=ai["priority"], ai_issue=ai["issue"], ai_action=ai["action"], ai_response=ai["response"],
            created_at=created, updated_at=created + timedelta(hours=random.randint(2,48))
        )
        db.add(req)
        db.flush()
        # events
        ev1 = MaintenanceEvent(request_id=req.id, status="Reported", actor_id=tenant.id, created_at=created)
        db.add(ev1)
        if rd["status"]!="Reported":
            ev2 = MaintenanceEvent(request_id=req.id, status=rd["status"], actor_id=tech.id if tech else manager.id, created_at=created+timedelta(hours=5))
            db.add(ev2)
        # note for completed
        if rd["status"]=="Completed" and tech:
            note = MaintenanceNote(request_id=req.id, author_id=tech.id, content=f"Repair completed. Replaced faulty part and tested. Cost ${rd['cost']}.")
            db.add(note)

    db.commit()

    # Notifications
    notifs = [
        Notification(user_id=manager.id, title="New maintenance request", message="Alex Morgan reported a plumbing leak at Sunrise Apartments – High priority."),
        Notification(user_id=manager.id, title="Recurring issue detected", message="Sunrise Apartments has 4 plumbing incidents in 60 days, 2.3x above average."),
        Notification(user_id=techs[0].id, title="New job assigned", message="Kitchen leak at Sunrise Apartments Unit 4B – FF-1043"),
        Notification(user_id=alex.id, title="Technician assigned", message="Carlos Rivera assigned to your request FF-1043. Expect contact soon."),
    ]
    for n in notifs: db.add(n)
    db.commit()
    return {"seeded": True}
