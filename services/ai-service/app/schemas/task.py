from pydantic import BaseModel
from typing import List, Optional

class TaskGenerateRequest(BaseModel):
    project_description: str
    num_tasks: Optional[int] = 5

class GeneratedTask(BaseModel):
    title: str
    description: str
    priority: str
    estimated_hours: float

class TaskGenerateResponse(BaseModel):
    tasks: List[GeneratedTask]
    summary: str
