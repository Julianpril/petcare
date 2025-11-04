-- ============================================
-- MIGRACIÓN: Agregar campos de Google OAuth
-- Ejecutar en PostgreSQL para soportar login con Google
-- ============================================

-- 1. Hacer password_hash nullable (usuarios de Google no tienen contraseña)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Agregar columna google_id (único para cada usuario de Google)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- 3. Agregar columna auth_provider (para saber de dónde viene el usuario)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';

-- 4. Actualizar usuarios existentes para que tengan auth_provider = 'local'
UPDATE users SET auth_provider = 'local' WHERE auth_provider IS NULL;

-- 5. Verificar las columnas agregadas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('password_hash', 'google_id', 'auth_provider')
ORDER BY column_name;

-- ============================================
-- RESULTADOS ESPERADOS:
-- ============================================
-- password_hash    | text          | YES  | NULL
-- google_id        | varchar(255)  | YES  | NULL
-- auth_provider    | varchar(50)   | YES  | 'local'::varchar
-- ============================================

COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID (sub claim from Google token)';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: local (email/password) or google (OAuth)';
COMMENT ON COLUMN users.password_hash IS 'Password hash (nullable for Google OAuth users)';
