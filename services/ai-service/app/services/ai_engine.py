import json
from openai import OpenAI
from app.core.config import settings
from app.schemas.task import TaskGenerateRequest, TaskGenerateResponse

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_tasks(self, request: TaskGenerateRequest) -> TaskGenerateResponse:
        # In a real production app, we would use a proper prompt
        prompt = f"""
        Generate {request.num_tasks} logical tasks for a project with the following description:
        "{request.project_description}"
        
        Return the response as a JSON object with:
        - "tasks": a list of objects with "title", "description", "priority" (LOW, MEDIUM, HIGH, URGENT), and "estimated_hours".
        - "summary": a brief overview of the project strategy.
        """
        
        try:
            # For demonstration, if key is placeholder, return mock data
            if settings.OPENAI_API_KEY == "sk-placeholder":
                return self._get_mock_tasks(request)

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return TaskGenerateResponse(**result)
            
        except Exception as e:
            # Fallback for demo
            return self._get_mock_tasks(request)

    async def parse_task(self, prompt_text: str) -> GeneratedTask:
        # Prompt for parsing a single task from natural language
        prompt = f"""
        Parse the following natural language request into a single task object:
        "{prompt_text}"
        
        Return the response as a JSON object with:
        - "title": a concise title.
        - "description": a detailed description.
        - "priority": LOW, MEDIUM, HIGH, or URGENT.
        - "estimated_hours": a float.
        """
        
        try:
            if settings.OPENAI_API_KEY == "sk-placeholder":
                return GeneratedTask(
                    title=prompt_text[:50], 
                    description=f"Generated from: {prompt_text}",
                    priority="MEDIUM",
                    estimated_hours=1.0
                )

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return GeneratedTask(**result)
            
        except Exception:
            return GeneratedTask(title=prompt_text[:50], description=prompt_text, priority="MEDIUM", estimated_hours=1.0)

    def _get_mock_tasks(self, request: TaskGenerateRequest) -> TaskGenerateResponse:
        # High quality mock data to show functionality
        return TaskGenerateResponse(
            summary=f"Strategy for: {request.project_description[:50]}...",
            tasks=[
                {
                    "title": "Initial Research & Requirements",
                    "description": "Gather all necessary data and define project scope.",
                    "priority": "HIGH",
                    "estimated_hours": 4.5
                },
                {
                    "title": "Environment Setup",
                    "description": "Configure development tools and infrastructure.",
                    "priority": "MEDIUM",
                    "estimated_hours": 2.0
                },
                {
                    "title": "Core Implementation Phase 1",
                    "description": "Build the foundational features of the project.",
                    "priority": "URGENT",
                    "estimated_hours": 12.0
                }
            ]
        )

ai_service = AIService()
