# Alembic Migrations

This directory contains database migration files.

To create a new migration:
```bash
alembic revision --autogenerate -m "Description"
```

To apply migrations:
```bash
alembic upgrade head
```
