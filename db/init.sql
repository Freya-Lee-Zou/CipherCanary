-- CipherCanary Database Initialization Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Create encryption_keys table
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    key_type VARCHAR(20) NOT NULL,
    key_material TEXT NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    key_size INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create encryption_operations table
CREATE TABLE IF NOT EXISTS encryption_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    operation_type VARCHAR(20) NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    key_id UUID REFERENCES encryption_keys(id) ON DELETE SET NULL,
    input_hash VARCHAR(64),
    output_hash VARCHAR(64),
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_owner ON encryption_keys(owner_id);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_algorithm ON encryption_keys(algorithm);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_encryption_operations_user ON encryption_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_encryption_operations_timestamp ON encryption_operations(created_at);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) 
VALUES (
    'admin',
    'admin@ciphercanary.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxq3re', -- admin123
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample encryption key
INSERT INTO encryption_keys (name, key_type, key_material, algorithm, key_size, owner_id)
SELECT 
    'Default AES Key',
    'symmetric',
    'sample-key-material-base64-encoded',
    'aes-256-gcm',
    256,
    u.id
FROM users u 
WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;

-- Create full-text search indexes
ALTER TABLE users ADD COLUMN IF NOT EXISTS tsv tsvector;
CREATE INDEX IF NOT EXISTS idx_users_tsv ON users USING GIN(tsv);

-- Update full-text search trigger function
CREATE OR REPLACE FUNCTION users_tsv_trigger() RETURNS trigger AS $$
begin
    new.tsv := to_tsvector('english', coalesce(new.username,'') || ' ' || coalesce(new.email,''));
    return new;
end
$$ LANGUAGE plpgsql;

-- Create trigger for full-text search
DROP TRIGGER IF EXISTS tsvupdate ON users;
CREATE TRIGGER tsvupdate BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE users_tsv_trigger();

-- Update existing records
UPDATE users SET tsv = to_tsvector('english', coalesce(username,'') || ' ' || coalesce(email,''));

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ciphercanary;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ciphercanary;
