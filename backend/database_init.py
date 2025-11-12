# app/database_init.py

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker
from database_models import Base, User, UserRole  # Import the Base and Models

# ⚠️ CRITICAL: Replace this with your actual PostgreSQL connection string
DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost:5432/trace_db"

def init_db():
    """Initializes the database connection and creates tables."""
    try:
        # Create engine and attempt connection
        engine = create_engine(DATABASE_URL)
        engine.connect()
        print("Database connection successful.")
        
        # Create all tables defined in Base (if they don't exist)
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully.")
        
        # Optionally, seed initial data (e.g., a default admin user)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        
        if session.query(User).count() == 0:
            # Hash this password securely in a real app (e.g., using passlib/bcrypt)
            default_admin = User(
                username="admin",
                hashed_password="insecure_admin_password_hash", 
                role=UserRole.ADMIN
            )
            session.add(default_admin)
            session.commit()
            print("Seeded default 'admin' user.")
            
        session.close()

    except OperationalError as e:
        print(f"ERROR: Could not connect to the database. Ensure PostgreSQL is running and the URL is correct.")
        print(f"Details: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    init_db()