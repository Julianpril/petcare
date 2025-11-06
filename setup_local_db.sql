-- ============================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS LOCAL
-- PostgreSQL Local: pawmi_db
-- Contraseña: 2502
-- ============================================

-- CONECTAR A LA BASE DE DATOS pawmi_db
-- Ejecuta esto desde psql: \c pawmi_db

-- ============================================
-- 1. HABILITAR EXTENSIONES NECESARIAS
-- ============================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensión para encriptación de contraseñas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. CREAR TABLAS
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    google_id VARCHAR(255) UNIQUE,
    picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mascotas
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age VARCHAR(50),
    age_years DECIMAL(5,2),
    weight VARCHAR(50),
    weight_kg DECIMAL(6,2),
    gender VARCHAR(20),
    color VARCHAR(100),
    image_url TEXT,
    traits TEXT[],
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de recordatorios
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    time TIME,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. CREAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_reminders_pet_id ON reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);

-- ============================================
-- 4. FUNCIÓN DE VERIFICACIÓN DE CONTRASEÑA
-- ============================================

CREATE OR REPLACE FUNCTION verify_password(username_input TEXT, password_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_password_hash TEXT;
  user_exists BOOLEAN;
BEGIN
  SELECT password_hash, TRUE INTO user_password_hash, user_exists
  FROM users
  WHERE username = username_input AND is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN (user_password_hash = crypt(password_input, user_password_hash));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. INSERTAR USUARIOS DE PRUEBA
-- ============================================

INSERT INTO users (email, username, password_hash, full_name, role) VALUES
('usuario1@pawmi.com', 'usuario1', crypt('contrasena1', gen_salt('bf')), 'Usuario Uno', 'user'),
('usuario2@pawmi.com', 'usuario2', crypt('contrasena2', gen_salt('bf')), 'Usuario Dos', 'user'),
('usuario3@pawmi.com', 'usuario3', crypt('contrasena3', gen_salt('bf')), 'Usuario Tres', 'user'),
('admin@pawmi.com', 'admin', crypt('admin123', gen_salt('bf')), 'Administrador', 'admin'),
('test@pawmi.com', 'test', crypt('test123', gen_salt('bf')), 'Usuario de Prueba', 'user')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 6. INSERTAR MASCOTAS DE EJEMPLO
-- ============================================

DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  pet1_id UUID;
  pet2_id UUID;
BEGIN
  SELECT id INTO user1_id FROM users WHERE username = 'usuario1' LIMIT 1;
  SELECT id INTO user2_id FROM users WHERE username = 'usuario2' LIMIT 1;
  
  IF user1_id IS NOT NULL THEN
    -- Max (Golden Retriever)
    INSERT INTO pets (owner_id, name, species, breed, age, age_years, weight, weight_kg, gender, color, image_url, traits, medical_history)
    VALUES (
      user1_id,
      'Max',
      'Dog',
      'Golden Retriever',
      '3 años',
      3.0,
      '30 kg',
      30.00,
      'Male',
      'Dorado',
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
      ARRAY['juguetón', 'amigable', 'energético'],
      'Vacunado. Última visita: Enero 2025'
    )
    RETURNING id INTO pet1_id;
    
    -- Luna (Siamés)
    INSERT INTO pets (owner_id, name, species, breed, age, age_years, weight, weight_kg, gender, color, image_url, traits, medical_history)
    VALUES (
      user1_id,
      'Luna',
      'Cat',
      'Siamés',
      '2 años',
      2.0,
      '4 kg',
      4.00,
      'Female',
      'Crema con puntos oscuros',
      'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400',
      ARRAY['tranquila', 'independiente', 'cariñosa'],
      'Esterilizada. Sin alergias conocidas'
    )
    RETURNING id INTO pet2_id;
    
    -- Recordatorio para Max
    IF pet1_id IS NOT NULL THEN
      INSERT INTO reminders (pet_id, user_id, category, title, description, start_date, time)
      VALUES (
        pet1_id,
        user1_id,
        'consulta',
        'Chequeo de Max',
        'Revisión general y actualización de vacunas',
        CURRENT_DATE + INTERVAL '2 days',
        '09:00:00'
      );
    END IF;
    
    -- Recordatorio para Luna
    IF pet2_id IS NOT NULL THEN
      INSERT INTO reminders (pet_id, user_id, category, title, description, start_date, time)
      VALUES (
        pet2_id,
        user1_id,
        'peluqueria',
        'Baño de Luna',
        'Baño y corte de uñas',
        CURRENT_DATE,
        '14:00:00'
      );
    END IF;
  END IF;
  
  IF user2_id IS NOT NULL THEN
    INSERT INTO pets (owner_id, name, species, breed, age, age_years, weight, weight_kg, gender, color, image_url, traits)
    VALUES (
      user2_id,
      'Rocky',
      'Dog',
      'Bulldog',
      '5 años',
      5.0,
      '25 kg',
      25.00,
      'Male',
      'Blanco con manchas marrones',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
      ARRAY['tranquilo', 'leal', 'dormilón']
    );
  END IF;
END $$;

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================

-- Verificar usuarios
SELECT 
  username, 
  email, 
  full_name, 
  role,
  is_active,
  created_at
FROM users
ORDER BY created_at DESC;

-- Verificar mascotas
SELECT 
  p.name,
  p.species,
  p.breed,
  u.username as owner_username
FROM pets p
JOIN users u ON p.owner_id = u.id
ORDER BY p.created_at DESC;

-- Verificar recordatorios
SELECT 
  r.title,
  r.category,
  r.start_date,
  r.time,
  p.name as pet_name,
  u.username as user_username
FROM reminders r
JOIN pets p ON r.pet_id = p.id
JOIN users u ON r.user_id = u.id
ORDER BY r.start_date;

-- ============================================
-- CONFIGURACIÓN COMPLETA ✅
-- ============================================
-- Base de datos: pawmi_db
-- Usuarios de prueba:
--   usuario1@pawmi.com / contrasena1
--   test@pawmi.com / test123
--   admin@pawmi.com / admin123
-- ============================================
