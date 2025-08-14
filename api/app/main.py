from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn

from .database import get_db, engine
from .models import Base
from .schemas import UserCreate, UserLogin, Token, User
from .services import auth_service, crypto_service
from .utils.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="CipherCanary API",
    description="A modern cryptography and security toolkit API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to CipherCanary API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "CipherCanary API"}

# Authentication endpoints
@app.post("/auth/register", response_model=User)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """User registration endpoint"""
    try:
        user = auth_service.create_user(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """User login endpoint"""
    try:
        token = auth_service.authenticate_user(db, user_credentials)
        return token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

# Cryptography endpoints
@app.post("/api/v1/encrypt")
async def encrypt_data(
    data: str,
    algorithm: str = "aes-256-gcm",
    key_id: str = None,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Encrypt data endpoint"""
    try:
        # Verify token and get user
        user = auth_service.get_current_user(db, credentials.credentials)
        
        # Encrypt the data
        result = crypto_service.encrypt_data(data, algorithm, key_id, user.id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/api/v1/decrypt")
async def decrypt_data(
    encrypted_data: str,
    algorithm: str = "aes-256-gcm",
    key_id: str = None,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Decrypt data endpoint"""
    try:
        # Verify token and get user
        user = auth_service.get_current_user(db, credentials.credentials)
        
        # Decrypt the data
        result = crypto_service.decrypt_data(encrypted_data, algorithm, key_id, user.id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.get("/api/v1/algorithms")
async def get_algorithms():
    """Get available encryption algorithms"""
    return {
        "algorithms": [
            {"name": "AES-256-GCM", "value": "aes-256-gcm", "type": "symmetric"},
            {"name": "ChaCha20-Poly1305", "value": "chacha20-poly1305", "type": "symmetric"},
            {"name": "RSA-4096", "value": "rsa-4096", "type": "asymmetric"},
            {"name": "Ed25519", "value": "ed25519", "type": "asymmetric"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
