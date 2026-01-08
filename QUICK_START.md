# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install Python backend dependencies
cd server
pip install -r requirements.txt

# Install frontend dependencies
cd ../client
npm install
```

### 2. Setup Database
```bash
# Create database
createdb trello_clone

# Configure environment
cd server
cp .env.example .env
# Edit .env with your database credentials

# Run migrations and seed
alembic upgrade head
python seed.py
```

### 3. Configure Frontend
```bash
cd client
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 4. Start Application
```bash
# From root directory
npm run dev
```

### 5. Open Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Docs: http://localhost:5000/docs

## 📋 What You Get

✅ Full Trello clone with all features
✅ Drag and drop functionality
✅ Card details with labels, checklists, members
✅ Search and filter
✅ File attachments
✅ Comments and activity
✅ Responsive design
✅ Sample data pre-loaded

## 🎯 Key Features

- **Boards**: Create and manage multiple boards
- **Lists**: Organize tasks in lists
- **Cards**: Create cards with full details
- **Drag & Drop**: Smooth reordering and moving
- **Labels**: Color-coded organization
- **Checklists**: Track progress with checklists
- **Members**: Assign team members
- **Due Dates**: Set and track deadlines
- **Attachments**: Upload files
- **Comments**: Collaborate with comments

## 📚 Documentation

- **README.md**: Full documentation
- **SETUP.md**: Detailed setup guide
- **DEPLOYMENT.md**: Deployment instructions
- **PROJECT_SUMMARY.md**: Complete feature list

## 🐛 Troubleshooting

**Database connection error?**
- Check PostgreSQL is running
- Verify DATABASE_URL in server/.env

**Port already in use?**
- Change PORT in server/.env
- Or kill process: `lsof -ti:5000 | xargs kill`

**Python/Import errors?**
```bash
cd server
pip install -r requirements.txt
```

**Database errors?**
```bash
cd server
alembic upgrade head
python seed.py
```

## 🎉 You're Ready!

Start creating boards and managing your projects!
