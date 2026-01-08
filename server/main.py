from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sys
import os
from dotenv import load_dotenv

# Add current directory to Python path for Render
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.routers import boards, lists, cards, labels, users, search

app = FastAPI(title="Trello Clone API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://trello-clone-frontend-one.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers
app.include_router(boards.router, prefix="/api/boards", tags=["boards"])
app.include_router(lists.router, prefix="/api/lists", tags=["lists"])
app.include_router(cards.router, prefix="/api/cards", tags=["cards"])
app.include_router(labels.router, prefix="/api/labels", tags=["labels"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Trello Clone API is running", "docs": "/api/docs"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Server is running"}

@app.get("/api/seed")
async def seed_database():
    try:
        from app.database import SessionLocal, engine, Base
        from app import models
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Use session context manager
        with SessionLocal() as db:
            # Check if data already exists
            existing_board = db.query(models.Board).first()
            if existing_board:
                return {"message": "Database already seeded"}
            
            # Create sample board
            board = models.Board(
                title="My Project Board",
                description="A sample project management board",
                background="#0079bf"
            )
            db.add(board)
            db.commit()
            db.refresh(board)
            
            # Create sample lists
            lists_data = [
                {"title": "To Do", "position": 0},
                {"title": "In Progress", "position": 1},
                {"title": "Done", "position": 2},
            ]
            
            for list_data in lists_data:
                list_item = models.List(**list_data, board_id=board.id)
                db.add(list_item)
            
            db.commit()
            
            return {"message": "Database seeded successfully", "board_id": board.id}
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)

# Export app for Render/Serverless
app = app
