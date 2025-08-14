from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# User schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: UUID
    is_active: bool
    role: str
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

# Encryption schemas
class EncryptionRequest(BaseModel):
    data: str = Field(..., description="Data to encrypt/decrypt")
    algorithm: str = Field(default="aes-256-gcm", description="Encryption algorithm")
    key_id: Optional[str] = Field(None, description="Specific key ID to use")

class EncryptionResponse(BaseModel):
    encrypted_data: str
    algorithm: str
    key_id: Optional[str] = None
    timestamp: datetime
    status: str = "success"

class DecryptionRequest(BaseModel):
    encrypted_data: str = Field(..., description="Encrypted data to decrypt")
    algorithm: str = Field(..., description="Encryption algorithm used")
    key_id: Optional[str] = Field(None, description="Key ID used for encryption")

class DecryptionResponse(BaseModel):
    decrypted_data: str
    algorithm: str
    key_id: Optional[str] = None
    timestamp: datetime
    status: str = "success"

# Key management schemas
class KeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    algorithm: str
    key_size: int
    expires_at: Optional[datetime] = None

class KeyResponse(BaseModel):
    id: UUID
    name: str
    algorithm: str
    key_size: int
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Algorithm schemas
class AlgorithmInfo(BaseModel):
    name: str
    value: str
    type: str
    description: Optional[str] = None
    key_sizes: List[int] = []

# Audit log schemas
class AuditLogResponse(BaseModel):
    id: int
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    timestamp: datetime
    user: User
    
    class Config:
        from_attributes = True

# Health check schemas
class HealthCheck(BaseModel):
    status: str
    service: str
    timestamp: datetime
    version: str
