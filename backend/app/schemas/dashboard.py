from pydantic import BaseModel, Field


class DashboardSummary(BaseModel):
    total_tasks: int = Field(ge=0)
    todo: int = Field(ge=0)
    in_progress: int = Field(ge=0)
    done: int = Field(ge=0)
    overdue_tasks: int = Field(ge=0)
