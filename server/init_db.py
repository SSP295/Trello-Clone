"""
Initialize the database - create tables and seed data
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from app.database import Base, engine

# Import all models to ensure they're registered
from app import models

def init_database():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    print("\nNext steps:")
    print("1. Run: python seed.py")
    print("2. Start server: python -m uvicorn main:app --reload")

if __name__ == "__main__":
    init_database()
