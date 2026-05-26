from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine, ensure_sqlite_schema
from app import models
from app.routes import auth, dashboard, health, projects, tasks, users

Base.metadata.create_all(bind=engine)
ensure_sqlite_schema()

app = FastAPI(title="Team Task Manager API")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
