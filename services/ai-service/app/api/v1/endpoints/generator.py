from fastapi import APIRouter, HTTPException
from app.schemas.task import TaskGenerateRequest, TaskGenerateResponse
from app.services.ai_engine import ai_service

router = APIRouter()

@router.post("/tasks", response_model=TaskGenerateResponse)
async def generate_tasks(request: TaskGenerateRequest):
    """
    Generate a list of tasks based on a project description using AI.
    """
    try:
        return await ai_service.generate_tasks(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse", response_model=GeneratedTask)
async def parse_task(payload: dict):
    """
    Parse a single natural language string into a task.
    """
    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    return await ai_service.parse_task(text)
