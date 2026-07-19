from app.database import SessionLocal
from app.models import User

def main():
    session = SessionLocal()
    try:
        users = session.query(User).all()
        print(f"Found {len(users)} users in the local database:")
        for u in users:
            print(f"- ID: {u.id}, Email: {u.email}, Verified: {u.is_verified}")
        
        if not users:
            print("No users to delete.")
            return

        print("\nDeleting all users...")
        num_deleted = session.query(User).delete()
        session.commit()
        print(f"Successfully deleted {num_deleted} users and all their associated tasks (cascade deleted).")
    except Exception as e:
        print("Error during cleanup:", e)
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    main()
