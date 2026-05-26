# Team Task Manager Backend

FastAPI backend setup with SQLAlchemy, SQLite, JWT helpers, and separated models, schemas, and routes.

## Structure

```text
app/
  core/       configuration, JWT/security utilities, shared dependencies
  db/         SQLAlchemy engine, session, and Base setup
  models/     SQLAlchemy models
  routes/     FastAPI routers
  schemas/    Pydantic request/response schemas
  main.py     application entrypoint
```

## Run

```powershell
cd backend
venv\Scripts\uvicorn.exe app.main:app --reload
```

The default SQLite database is `team_task_manager.db`.
