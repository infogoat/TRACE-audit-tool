# backend/database_init.py

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker
from database_models import Base  # ONLY Base import karo

DATABASE_URL = "sqlite:///trace.db"

def init_db():
    try:
        engine = create_engine(DATABASE_URL)
        engine.connect()
        print("Database connection successful.")

        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully.")

    except OperationalError as e:
        print("ERROR: Could not connect to the database.")
        print(e)

    except Exception as e:
        print("An unexpected error occurred:", e)

if __name__ == "__main__":
    init_db()
