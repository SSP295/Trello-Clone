from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

load_dotenv()

from app.routers import boards, lists, cards, labels, users, search

app = FastAPI(title="Trello Clone API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Server is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
