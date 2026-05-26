from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_project_role
from app.db.database import get_db
from app.models.project import Project, ProjectRole, project_members
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter()


def get_owned_project_or_404(project_id: int, owner_id: int, db: Session) -> Project:
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


def is_project_member(project: Project, user_id: int) -> bool:
    return any(member.id == user_id for member in project.members)


def validate_assignee(project: Project, user_id: int | None) -> None:
    if user_id is None:
        return
    if not is_project_member(project, user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assigned user must be a project member",
        )


def require_task_manager_project(project_id: int, user_id: int, db: Session) -> Project:
    project = db.get(Project, project_id)
    role = get_project_role(db, project_id, user_id)
    if project is None or role not in {ProjectRole.owner, ProjectRole.manager}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner or manager role required for this project",
        )
    return project


def get_accessible_task_or_404(task_id: int, user_id: int, db: Session) -> Task:
    task = db.scalar(
        select(Task)
        .join(Project)
        .where(
            Task.id == task_id,
            or_(
                Project.owner_id == user_id,
                Project.id.in_(
                    select(project_members.c.project_id).where(
                        project_members.c.user_id == user_id,
                        project_members.c.role == ProjectRole.manager.value,
                    )
                ),
                and_(
                    Task.assigned_to == user_id,
                    Project.members.any(User.id == user_id),
                ),
            ),
        )
    )
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    project = require_task_manager_project(task_in.project_id, current_user.id, db)
    validate_assignee(project, task_in.assigned_to)

    task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status.value,
        priority=task_in.priority.value,
        owner_id=current_user.id,
        project_id=task_in.project_id,
        assigned_to=task_in.assigned_to,
        due_date=task_in.due_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Task]:
    return list(
        db.scalars(
            select(Task)
            .join(Project)
            .where(
                or_(
                    Project.owner_id == current_user.id,
                    Project.id.in_(
                        select(project_members.c.project_id).where(
                            project_members.c.user_id == current_user.id,
                            project_members.c.role == ProjectRole.manager.value,
                        )
                    ),
                    and_(
                        Task.assigned_to == current_user.id,
                        Project.members.any(User.id == current_user.id),
                    ),
                )
            )
            .order_by(Task.created_at.desc())
        )
    )


@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    return get_accessible_task_or_404(task_id, current_user.id, db)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    task = get_accessible_task_or_404(task_id, current_user.id, db)
    update_data = task_in.model_dump(exclude_unset=True)
    role = get_project_role(db, task.project_id, current_user.id)

    if role == ProjectRole.member:
        if set(update_data) - {"status"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Project members can update only task status",
            )
    elif role not in {ProjectRole.owner, ProjectRole.manager}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this task",
        )

    if "status" in update_data and update_data["status"] is not None:
        update_data["status"] = update_data["status"].value
    if "priority" in update_data and update_data["priority"] is not None:
        update_data["priority"] = update_data["priority"].value
    if "assigned_to" in update_data:
        validate_assignee(task.project, update_data["assigned_to"])

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    task = get_accessible_task_or_404(task_id, current_user.id, db)
    if task.project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can delete tasks",
        )
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
