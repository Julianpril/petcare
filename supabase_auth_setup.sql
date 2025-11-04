-- ============================================
-- FUNCIÓN DE VERIFICACIÓN DE CONTRASEÑA
-- Para autenticación en Supabase
-- ============================================

-- Función para verificar contraseña
CREATE OR REPLACE FUNCTION verify_password(username_input TEXT, password_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_password_hash TEXT;
  user_exists BOOLEAN;
BEGIN
  -- Verificar si el usuario existe y obtener su hash
  SELECT password_hash, TRUE INTO user_password_hash, user_exists
  FROM users
  WHERE username = username_input AND is_active = true
  LIMIT 1;
  
  -- Si el usuario no existe, retornar false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar la contraseña usando crypt
  RETURN (user_password_hash = crypt(password_input, user_password_hash));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSERTAR USUARIOS DE PRUEBA
-- ============================================

-- Insertar usuarios con contraseñas hasheadas
INSERT INTO users (email, username, password_hash, full_name, role) VALUES
('usuario1@pawmi.com', 'usuario1', crypt('contrasena1', gen_salt('bf')), 'Usuario Uno', 'user'),
('usuario2@pawmi.com', 'usuario2', crypt('contrasena2', gen_salt('bf')), 'Usuario Dos', 'user'),
('usuario3@pawmi.com', 'usuario3', crypt('contrasena3', gen_salt('bf')), 'Usuario Tres', 'user'),
('admin@pawmi.com', 'admin', crypt('admin123', gen_salt('bf')), 'Administrador', 'admin'),
('test@pawmi.com', 'test', crypt('test123', gen_salt('bf')), 'Usuario de Prueba', 'user')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- INSERTAR MASCOTAS DE EJEMPLO
-- ============================================

-- Obtener el ID del usuario1 para insertar mascotas
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  pet1_id UUID;
  pet2_id UUID;
BEGIN
  -- Obtener IDs de usuarios
  SELECT id INTO user1_id FROM users WHERE username = 'usuario1' LIMIT 1;
  SELECT id INTO user2_id FROM users WHERE username = 'usuario2' LIMIT 1;
  
  -- Insertar mascotas solo si los usuarios existen
  IF user1_id IS NOT NULL THEN
    -- Mascota 1: Max (Perro)
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
    
    -- Mascota 2: Luna (Gata)
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
    
    -- Insertar recordatorio de ejemplo para Max
    IF pet1_id IS NOT NULL THEN
      INSERT INTO reminders (pet_id, user_id, category, title, description, start_date, time)
      VALUES (
        pet1_id,
        user1_id,
        'consulta',
        'Chequeo de Max',
        'Revisión general y actualización de vacunas',
        CURRENT_DATE + INTERVAL '7 days',
        '09:00:00'
      );
    END IF;
    
    -- Insertar recordatorio de ejemplo para Luna
    IF pet2_id IS NOT NULL THEN
      INSERT INTO reminders (pet_id, user_id, category, title, description, start_date, time)
      VALUES (
        pet2_id,
        user1_id,
        'peluqueria',
        'Baño de Luna',
        'Baño y corte de uñas',
        CURRENT_DATE + INTERVAL '5 days',
        '14:00:00'
      );
    END IF;
  END IF;
  
  -- Insertar mascota para usuario2
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
-- VERIFICACIÓN
-- ============================================

-- Verificar que los usuarios se insertaron correctamente
SELECT 
  username, 
  email, 
  full_name, 
  role,
  is_active,
  created_at
FROM users
ORDER BY created_at DESC;

-- Verificar que las mascotas se insertaron correctamente
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
  p.name as pet_name,
  u.username as user_username
FROM reminders r
JOIN pets p ON r.pet_id = p.id
JOIN users u ON r.user_id = u.id
ORDER BY r.start_date;
