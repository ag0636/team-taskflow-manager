from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings

settings = get_settings()

connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_sqlite_schema() -> None:
    if not settings.database_url.startswith("sqlite"):
        return

    with engine.begin() as connection:
        task_columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(tasks)")).fetchall()
        }
        if task_columns and "project_id" not in task_columns:
            connection.execute(text("ALTER TABLE tasks ADD COLUMN project_id INTEGER"))
            connection.execute(
                text("CREATE INDEX IF NOT EXISTS ix_tasks_project_id ON tasks(project_id)")
            )
        if task_columns and "assigned_to" not in task_columns:
            connection.execute(text("ALTER TABLE tasks ADD COLUMN assigned_to INTEGER"))
            connection.execute(
                text("CREATE INDEX IF NOT EXISTS ix_tasks_assigned_to ON tasks(assigned_to)")
            )
        if task_columns and "due_date" not in task_columns:
            connection.execute(text("ALTER TABLE tasks ADD COLUMN due_date DATETIME"))

        project_member_columns = {
            row[1]
            for row in connection.execute(
                text("PRAGMA table_info(project_members)")
            ).fetchall()
        }
        project_columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(projects)")).fetchall()
        }
        if {"project_id", "user_id"} <= project_member_columns and {
            "id",
            "owner_id",
        } <= project_columns:
            if "role" not in project_member_columns:
                connection.execute(
                    text(
                        "ALTER TABLE project_members "
                        "ADD COLUMN role VARCHAR(50) DEFAULT 'member'"
                    )
                )
            connection.execute(
                text(
                    "INSERT OR IGNORE INTO project_members (project_id, user_id, role) "
                    "SELECT id, owner_id, 'owner' FROM projects"
                )
            )
            connection.execute(
                text(
                    "UPDATE project_members "
                    "SET role = 'owner' "
                    "WHERE EXISTS ("
                    "  SELECT 1 FROM projects "
                    "  WHERE projects.id = project_members.project_id "
                    "  AND projects.owner_id = project_members.user_id"
                    ")"
                )
            )
