import re
import os

# Deterministic mock AI - keyword based
# Also supports real OpenAI if key present (optional)

def mock_analyze(description: str):
    d = description.lower()
    # category
    if any(k in d for k in ["leak", "pipe", "water", "sink", "faucet", "toilet", "drain", "plumb"]):
        category = "Plumbing"
        issue = "Water leak / plumbing failure"
        action = "Inspect supply line, drain connection, or pipe seal. Shut off water if leak is active."
        priority = "High"
    elif any(k in d for k in ["power", "outlet", "light", "electric", "wiring", "breaker", "switch"]):
        category = "Electrical"
        issue = "Electrical fault"
        action = "Avoid using affected circuit. Have a licensed electrician inspect wiring and breaker."
        priority = "High"
    elif any(k in d for k in ["ac ", "air condition", "hvac", "heating", "cool", "thermostat", "vent"]):
        category = "HVAC"
        issue = "HVAC performance issue"
        action = "Check filter, thermostat settings, and schedule HVAC technician inspection."
        priority = "Medium"
    elif any(k in d for k in ["fridge", "refrigerator", "washer", "dryer", "dishwasher", "oven", "appliance"]):
        category = "Appliance"
        issue = "Appliance malfunction"
        action = "Unplug if safety concern, avoid further use until inspected by appliance technician."
        priority = "Medium"
    elif any(k in d for k in ["crack", "wall", "ceiling", "roof", "structural", "foundation", "mold"]):
        category = "Structural"
        issue = "Structural / surface damage"
        action = "Document damage, restrict access if safety risk, schedule structural assessment."
        priority = "High"
    elif any(k in d for k in ["wifi", "internet", "router", "network"]):
        category = "Internet"
        issue = "Connectivity issue"
        action = "Restart router, check provider status, schedule network check if unresolved."
        priority = "Low"
    else:
        category = "Other"
        issue = "General maintenance request"
        action = "Review details and assign appropriate technician for inspection."
        priority = "Medium"

    # urgency adjustments
    if any(k in d for k in ["flood", "burst", "sparking", "smoke", "gas", "no water", "sewage", "urgent", "emergency"]):
        priority = "Critical"
    elif any(k in d for k in ["slow", "minor", "small", "noise"]):
        if priority == "High":
            priority = "Medium"

    response_map = {
        "Critical": "This appears urgent. We recommend limiting use of the affected area and a technician will inspect as soon as possible.",
        "High": "Please avoid using the affected fixture/area until the leak/issue is inspected.",
        "Medium": "We've logged your request — a technician will review and schedule soon.",
        "Low": "Thanks for reporting. We'll route this to the right technician shortly."
    }
    return {
        "category": category,
        "issue": issue,
        "priority": priority,
        "action": action,
        "response": response_map.get(priority, response_map["Medium"]),
        "is_mock": True
    }

def analyze_maintenance(description: str):
    api_key = os.getenv("OPENAI_API_KEY")
    if api_type := os.getenv("AI_PROVIDER", ""):
        pass
    # If OpenAI key exists, try real call, else fallback
    if api_key and os.getenv("USE_REAL_AI") == "1":
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            prompt = f"""Analyze this property maintenance description and return JSON with keys: category (Plumbing/Electrical/HVAC/Appliance/Structural/Internet/Other), issue (short title), priority (Low/Medium/High/Critical), action (one sentence safe recommendation), response (tenant-facing message). Description: "{description}" """
            resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role":"user","content":prompt}], temperature=0.2, response_format={"type":"json_object"})
            import json
            data = json.loads(resp.choices[0].message.content)
            # normalize
            return {
                "category": data.get("category","Other"),
                "issue": data.get("issue","Maintenance issue"),
                "priority": data.get("priority","Medium"),
                "action": data.get("action","Schedule inspection with appropriate technician."),
                "response": data.get("response","We'll have a technician review shortly."),
                "is_mock": False
            }
        except Exception as e:
            print("AI fallback:", e)
            return mock_analyze(description)
    else:
        return mock_analyze(description)
