from fastapi import APIRouter
from pydantic import BaseModel
from ..ai_service import analyze_maintenance

router = APIRouter(prefix="/api/ai", tags=["ai"])

class AnalyzeReq(BaseModel):
    description: str

@router.post("/analyze-maintenance")
def analyze(req: AnalyzeReq):
    result = analyze_maintenance(req.description)
    return result
