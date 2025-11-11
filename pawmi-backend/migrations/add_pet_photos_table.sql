-- Migration: Add pet_photos table for gallery management
-- Created: 2025-11-08
-- Description: Tabla para gestionar galería de fotos de mascotas con soporte para antes/después

-- Create pet_photos table
CREATE TABLE IF NOT EXISTS pet_photos (
    id VARCHAR PRIMARY KEY,
    pet_id VARCHAR NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    
    -- Categoría de la foto
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    -- Categorías: general, medical, before, after, profile, vaccination, grooming
    
    -- Descripción opcional
    description TEXT,
    
    -- ID de tratamiento relacionado (para fotos antes/después)
    treatment_id VARCHAR,
    
    -- Indica si es la foto principal/perfil
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    taken_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pet_photos_pet_id ON pet_photos(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_photos_category ON pet_photos(category);
CREATE INDEX IF NOT EXISTS idx_pet_photos_treatment_id ON pet_photos(treatment_id);
CREATE INDEX IF NOT EXISTS idx_pet_photos_is_primary ON pet_photos(is_primary);
CREATE INDEX IF NOT EXISTS idx_pet_photos_created_at ON pet_photos(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_pet_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pet_photos_updated_at
    BEFORE UPDATE ON pet_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_pet_photos_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE pet_photos IS 'Galería de fotografías de mascotas con categorización';
COMMENT ON COLUMN pet_photos.category IS 'Categoría: general, medical, before, after, profile, vaccination, grooming';
COMMENT ON COLUMN pet_photos.treatment_id IS 'ID del tratamiento para fotos antes/después';
COMMENT ON COLUMN pet_photos.is_primary IS 'Marca la foto como principal/perfil de la mascota';
