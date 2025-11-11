-- Script para agregar columnas de refugio a la tabla users en la base de datos local
-- Ejecutar este script en PostgreSQL para sincronizar con el modelo de SQLAlchemy

-- Agregar columnas de refugio
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS shelter_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shelter_description TEXT,
ADD COLUMN IF NOT EXISTS shelter_license VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_verified_shelter BOOLEAN DEFAULT FALSE;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('shelter_name', 'shelter_description', 'shelter_license', 'is_verified_shelter')
ORDER BY column_name;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Columnas de refugio agregadas correctamente a la tabla users';
END $$;
