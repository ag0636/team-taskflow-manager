from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import delete, insert, or_, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_project_role, require_project_owner
from app.db.database import get_db
from app.models.project import Project, ProjectRole, project_members
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.user import UserRead

router = APIRouter()


def get_owned_project_or_404(
    project_id: int,
    owner_id: int,
    db: Session,
) -> Project:
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


def get_project_for_user_or_404(project_id: int, user_id: int, db: Session) -> Project:
    project = db.get(Project, project_id)
    if project is None or get_project_role(db, project_id, user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


def get_user_or_404(user_id: int, db: Session) -> User:
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Project:
    project = Project(
        name=project_in.name,
        description=project_in.description,
        owner_id=current_user.id,
    )
    db.add(project)
    db.flush()
    db.execute(
        insert(project_members).values(
            project_id=project.id,
            user_id=current_user.id,
            role=ProjectRole.owner.value,
        )
    )
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Project]:
    return list(
        db.scalars(
            select(Project)
            .where(
                or_(
                    Project.owner_id == current_user.id,
                    Project.members.any(User.id == current_user.id),
                )
            )
            .order_by(Project.created_at.desc())
        )
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Project:
    return get_project_for_user_or_404(project_id, current_user.id, db)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Project:
    project = get_owned_project_or_404(project_id, current_user.id, db)
    update_data = project_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    project = require_project_owner(project_id, db, current_user)
    db.delete(project)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{project_id}/members/{user_id}",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def add_project_member(
    project_id: int,
    user_id: int,
    role: ProjectRole = ProjectRole.member,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    project = require_project_owner(project_id, db, current_user)
    user = get_user_or_404(user_id, db)

    if role == ProjectRole.owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use project ownership to assign the owner role",
        )
    if get_project_role(db, project.id, user.id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a project member",
        )

    db.execute(
        insert(project_members).values(
            project_id=project.id,
            user_id=user.id,
            role=role.value,
        )
    )
    db.commit()
    db.refresh(user)
    return user


@router.delete(
    "/{project_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_project_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    project = require_project_owner(project_id, db, current_user)
    user = get_user_or_404(user_id, db)

    if user.id == project.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project owner cannot be removed from members",
        )
    if get_project_role(db, project.id, user.id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a project member",
        )

    db.execute(
        delete(project_members).where(
            project_members.c.project_id == project.id,
            project_members.c.user_id == user.id,
        )
    )
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{project_id}/members", response_model=list[UserRead])
def list_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[User]:
    project = get_project_for_user_or_404(project_id, current_user.id, db)
    return project.members
