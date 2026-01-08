"""
Check database connection and configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("=== Database Configuration Check ===\n")

# Check .env file
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    print("[OK] .env file exists")
    with open(env_path, 'r') as f:
        content = f.read()
        if "DATABASE_URL" in content:
            print("[OK] DATABASE_URL found in .env")
            # Don't print the full URL for security
            db_url = os.getenv("DATABASE_URL", "")
            if db_url:
                # Mask password in output
                if "@" in db_url:
                    parts = db_url.split("@")
                    if len(parts) == 2:
                        masked = parts[0].split(":")[0] + ":****@" + parts[1]
                        print(f"  DATABASE_URL: {masked}")
                else:
                    print(f"  DATABASE_URL: {db_url[:50]}...")
        else:
            print("[ERROR] DATABASE_URL not found in .env")
else:
    print("[ERROR] .env file NOT found")

print("\n=== Testing Database Connection ===\n")

try:
    from app.database import engine
    print("[OK] Database engine created")
    
    # Try to connect
    with engine.connect() as conn:
        print("[OK] Successfully connected to database!")
        result = conn.execute("SELECT version();")
        version = result.fetchone()[0]
        print(f"  PostgreSQL version: {version[:50]}...")
        
except Exception as e:
    print(f"[ERROR] Connection failed: {type(e).__name__}")
    print(f"  Error: {str(e)}")
    print("\n=== Troubleshooting Steps ===")
    print("1. Make sure PostgreSQL service is running")
    print("2. Check DATABASE_URL in .env file")
    print("3. Verify database 'trello_clone' exists")
    print("4. Check username and password are correct")
    print("5. Verify PostgreSQL is listening on port 5432")
