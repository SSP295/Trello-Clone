# FastAPI Backend Server

This is the FastAPI backend server for the Trello Clone application.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Seed the database:**
   ```bash
   python seed.py
   ```

## Running the Server

### Development Mode
```bash
python -m uvicorn main:app --reload --port 5000
```

Or use the run script:
```bash
python run.py
```

### Production Mode
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 5000
```

## API Documentation

Once the server is running, you can access:
- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

## Project Structure

```
server/
├── app/
│   ├── __init__.py
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   └── routers/             # API route handlers
│       ├── __init__.py
│       ├── boards.py
│       ├── lists.py
│       ├── cards.py
│       ├── labels.py
│       ├── users.py
│       └── search.py
├── alembic/                 # Database migrations
├── uploads/                 # File uploads
├── main.py                  # FastAPI application
├── run.py                   # Run script
├── seed.py                  # Database seed script
└── requirements.txt         # Python dependencies
```

## Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
