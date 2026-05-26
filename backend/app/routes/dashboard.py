from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.project import Project, ProjectRole, project_members
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.schemas.dashboard import DashboardSummary

router = APIRouter()


def accessible_tasks_query(user_id: int):
    return (
        select(Task)
        .join(Project)
        .where(
            or_(
                Project.owner_id == user_id,
                Project.id.in_(
                    select(project_members.c.project_id).where(
                        project_members.c.user_id == user_id,
                        project_members.c.role == ProjectRole.manager.value,
                    )
                ),
                Task.assigned_to == user_id,
            )
        )
    )


def count_tasks_by_status(db: Session, user_id: int, status: TaskStatus) -> int:
    return db.scalar(
        accessible_tasks_query(user_id)
        .with_only_columns(func.count(Task.id))
        .where(Task.status == status.value)
    ) or 0


def count_overdue_tasks(db: Session, user_id: int) -> int:
    return db.scalar(
        accessible_tasks_query(user_id)
        .with_only_columns(func.count(Task.id))
        .where(
            Task.status != TaskStatus.done.value,
            Task.due_date.is_not(None),
            Task.due_date < datetime.utcnow(),
        )
    ) or 0


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardSummary:
    total_tasks = db.scalar(
        accessible_tasks_query(current_user.id).with_only_columns(func.count(Task.id))
    ) or 0

    return DashboardSummary(
        total_tasks=total_tasks,
        todo=count_tasks_by_status(db, current_user.id, TaskStatus.todo),
        in_progress=count_tasks_by_status(db, current_user.id, TaskStatus.in_progress),
        done=count_tasks_by_status(db, current_user.id, TaskStatus.done),
        overdue_tasks=count_overdue_tasks(db, current_user.id),
    )
