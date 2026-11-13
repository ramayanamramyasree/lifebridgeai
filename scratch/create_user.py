import os, sys
sys.path.append('c:/lifebridge-ai')
from backend.database import SessionLocal
from backend.models import User
from backend.auth import get_password_hash, create_access_token

def main():
    email = 'testolder@example.com'
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash('Password123!'),
            full_name='Test Older',
            life_stage='older_adult',
            preferred_language='en',
            role='user'
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print('Created user')
    else:
        print('User exists')
    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    print('TOKEN:', token)

if __name__ == '__main__':
    main()
