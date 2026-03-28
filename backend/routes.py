from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas, auth
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()

router = APIRouter()

SECRET_KEY = "secret123"

# DB connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get current user from token
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]
    except:
        return None

# Register
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        return {"error": "User already exists"}

    hashed = auth.hash_password(user.password)
    new_user = models.User(email=user.email, password=hashed)
    db.add(new_user)
    db.commit()
    return {"msg": "User created"}

# Login
@router.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user or not auth.verify_password(user.password, db_user.password):
        return {"error": "Invalid credentials"}

    token = auth.create_token({"user_id": db_user.id})
    return {"token": token}

# Create Task (Protected)
@router.post("/tasks")
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    if not user_id:
        return {"error": "Unauthorized"}

    new_task = models.Task(**task.dict(), user_id=user_id)
    db.add(new_task)
    db.commit()
    return {"msg": "Task created"}

# Get Tasks (Protected)
@router.get("/tasks")
def get_tasks(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    if not user_id:
        return {"error": "Unauthorized"}

    return db.query(models.Task).filter(models.Task.user_id == user_id).all()