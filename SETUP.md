# Quick Setup Guide

## Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed (for frontend)
- PostgreSQL 14+ installed and running
- pip (Python package manager)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Database Setup

#### Create Database
```bash
# Using psql
psql -U postgres
CREATE DATABASE trello_clone;
\q

# Or using createdb command
createdb trello_clone
```

#### Configure Environment
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/trello_clone?schema=public"
PORT=5000
NODE_ENV=development
```

Replace `username` and `password` with your PostgreSQL credentials.

#### Run Migrations
```bash
cd server
alembic upgrade head
python seed.py
```

### 3. Create Uploads Directory

```bash
mkdir -p server/uploads
```

### 4. Configure Frontend

```bash
cd client
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 5. Start the Application

From the root directory:

```bash
npm run dev
```

This starts:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `server/.env`
- Verify database exists: `psql -l | grep trello_clone`

### Port Already in Use
- Change PORT in `server/.env`
- Or kill the process: `lsof -ti:5000 | xargs kill`

### Database Errors
```bash
cd server
alembic upgrade head
python seed.py
```

### Python/Import Errors
```bash
cd server
pip install -r requirements.txt
```

## Verification

1. Open http://localhost:3000
2. You should see a board list page
3. Click on a board to view it
4. Try creating a list, adding cards, and dragging them around

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check API endpoints in the README
- Explore the codebase structure
