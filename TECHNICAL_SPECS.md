# CipherCanary - Technical Specifications

## 🛠️ Technology Stack

### Backend Technologies
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Message Queue**: Celery + Redis
- **ORM**: SQLAlchemy 2.0+
- **Authentication**: JWT + OAuth2

### Frontend Technologies
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) v5+
- **State Management**: Redux Toolkit + RTK Query
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production)
- **Reverse Proxy**: NGINX
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

## 🔌 API Specifications

### Authentication Endpoints

#### POST /auth/login
```json
{
  "username": "string",
  "password": "string",
  "totp_code": "string (optional)"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "permissions": ["string"]
  }
}
```

#### POST /auth/refresh
```json
{
  "refresh_token": "string"
}
```

### Encryption Endpoints

#### POST /api/v1/encrypt
```json
{
  "algorithm": "aes-256-gcm",
  "data": "base64_encoded_data",
  "key_id": "uuid (optional)",
  "options": {
    "padding": "pkcs7",
    "mode": "gcm"
  }
}
```

**Response:**
```json
{
  "encrypted_data": "base64_encoded",
  "iv": "base64_encoded",
  "tag": "base64_encoded",
  "algorithm": "aes-256-gcm",
  "key_id": "uuid"
}
```

#### POST /api/v1/decrypt
```json
{
  "encrypted_data": "base64_encoded",
  "iv": "base64_encoded",
  "tag": "base64_encoded",
  "key_id": "uuid",
  "algorithm": "aes-256-gcm"
}
```

### Key Management Endpoints

#### POST /api/v1/keys
```json
{
  "name": "string",
  "algorithm": "aes-256",
  "key_size": 256,
  "expires_at": "iso_datetime (optional)",
  "tags": ["string"]
}
```

#### GET /api/v1/keys
**Query Parameters:**
- `algorithm`: Filter by algorithm
- `status`: Filter by status (active, expired, revoked)
- `page`: Page number for pagination
- `limit`: Items per page

## 🗄️ Database Design

### Extended Schema

#### Key Rotation Table
```sql
CREATE TABLE key_rotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    old_key_id UUID REFERENCES encryption_keys(id),
    new_key_id UUID REFERENCES encryption_keys(id),
    rotation_reason VARCHAR(100),
    rotated_by UUID REFERENCES users(id),
    rotated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending'
);
```

#### Encryption Policies
```sql
CREATE TABLE encryption_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    key_size INTEGER NOT NULL,
    key_lifetime_days INTEGER,
    rotation_policy JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

#### Audit Trail
```sql
CREATE TABLE audit_trail (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_encryption_keys_algorithm ON encryption_keys(algorithm);
CREATE INDEX idx_encryption_keys_status ON encryption_keys(is_active);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_encryption_operations_status ON encryption_operations(status);

-- Full-text search indexes
CREATE INDEX idx_users_fts ON users USING GIN(to_tsvector('english', username || ' ' || email));
CREATE INDEX idx_encryption_keys_fts ON encryption_keys USING GIN(to_tsvector('english', name));
```

## 🔐 Security Implementation

### Password Security
```python
# Password hashing with Argon2
import argon2

ph = argon2.PasswordHasher(
    time_cost=3,        # 3 iterations
    memory_cost=65536,   # 64MB memory usage
    parallelism=4,       # 4 parallel threads
    hash_len=32         # 32 bytes hash length
)

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(password: str, hash: str) -> bool:
    try:
        ph.verify(hash, password)
        return True
    except argon2.exceptions.VerifyMismatchError:
        return False
```

### JWT Token Security
```python
# JWT configuration
JWT_ALGORITHM = "RS256"
JWT_PRIVATE_KEY = load_private_key()
JWT_PUBLIC_KEY = load_public_key()
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7

# Token validation
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_PRIVATE_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt
```

### Rate Limiting
```python
# Redis-based rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@app.exception_handler(RateLimitExceeded)
async def ratelimit_handler(request, exc):
    return _rate_limit_exceeded_handler(request, exc)

@app.post("/api/v1/encrypt")
@limiter.limit("100/minute")
async def encrypt_data(request: Request, data: EncryptionRequest):
    # Implementation
    pass
```

## 🚀 Performance Optimization

### Database Connection Pooling
```python
# SQLAlchemy connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,           # Maximum connections
    max_overflow=30,        # Additional connections
    pool_pre_ping=True,     # Connection health check
    pool_recycle=3600       # Recycle connections every hour
)
```

### Caching Strategy
```python
# Redis caching with TTL
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(ttl_seconds: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, ttl_seconds, json.dumps(result))
            return result
        return wrapper
    return decorator
```

### Async Processing
```python
# Celery task for heavy operations
from celery import Celery

celery_app = Celery('ciphercanary', broker='redis://localhost:6379/0')

@celery_app.task(bind=True)
def encrypt_large_file(self, file_path: str, algorithm: str, key_id: str):
    try:
        # Process large file in chunks
        result = process_file_encryption(file_path, algorithm, key_id)
        return {"status": "success", "result": result}
    except Exception as exc:
        self.retry(exc=exc, countdown=60, max_retries=3)
```

## 📊 Monitoring & Metrics

### Custom Metrics
```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, Gauge

# Counters
encryption_operations_total = Counter(
    'encryption_operations_total',
    'Total number of encryption operations',
    ['algorithm', 'status']
)

# Histograms
encryption_duration_seconds = Histogram(
    'encryption_duration_seconds',
    'Time spent on encryption operations',
    ['algorithm']
)

# Gauges
active_keys_total = Gauge(
    'active_keys_total',
    'Total number of active encryption keys'
)
```

### Health Checks
```python
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {}
    }
    
    # Database health
    try:
        db.execute(text("SELECT 1"))
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Redis health
    try:
        redis_client.ping()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    return health_status
```

## 🧪 Testing Strategy

### Unit Tests
```python
# pytest configuration
import pytest
from unittest.mock import Mock, patch

class TestEncryptionService:
    @pytest.fixture
    def encryption_service(self):
        return EncryptionService()
    
    @pytest.fixture
    def mock_key_service(self):
        return Mock()
    
    def test_encrypt_data_success(self, encryption_service, mock_key_service):
        # Test implementation
        pass
    
    def test_encrypt_data_invalid_key(self, encryption_service):
        # Test error handling
        pass
```

### Integration Tests
```python
# Testcontainers for integration testing
import pytest
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer

@pytest.fixture(scope="session")
def postgres_container():
    with PostgresContainer("postgres:15") as postgres:
        yield postgres

@pytest.fixture(scope="session")
def redis_container():
    with RedisContainer("redis:7-alpine") as redis:
        yield redis
```

### Security Tests
```python
# OWASP ZAP integration
import subprocess

def test_security_scan():
    """Run OWASP ZAP security scan"""
    result = subprocess.run([
        "zap-baseline.py",
        "-t", "http://localhost:8000",
        "-J", "security-report.json"
    ], capture_output=True, text=True)
    
    assert result.returncode == 0, "Security scan failed"
```

## 🔄 CI/CD Configuration

### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml
          coverage report --fail-under=90
      
      - name: Run security scan
        run: |
          bandit -r app/
          safety check

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Build Docker image
        run: docker build -t ciphercanary:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ciphercanary:${{ github.sha }}
```

### Docker Multi-stage Build
```dockerfile
# Dockerfile
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📈 Performance Benchmarks

### Target Performance Metrics
- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 50ms (95th percentile)
- **Encryption Throughput**: > 100MB/s for AES-256
- **Concurrent Users**: > 1000 simultaneous connections
- **Memory Usage**: < 512MB per container
- **CPU Usage**: < 70% under normal load

### Load Testing
```python
# k6 load testing script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests < 200ms
    http_req_failed: ['rate<0.01'],   // < 1% error rate
  },
};

export default function() {
  let response = http.post('http://localhost:8000/api/v1/encrypt', {
    algorithm: 'aes-256-gcm',
    data: 'dGVzdCBkYXRh', // base64 encoded "test data"
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

---

*This technical specification document provides implementation details and technical requirements for the CipherCanary project. It should be updated as the project evolves and new requirements are identified.*
