-- Migration: Add Walker Tables
-- Descripción: Crea las tablas para el sistema de paseadores (walkers, reviews, bookings)
-- Fecha: 2025

-- ============= WALKER PROFILES =============
CREATE TABLE IF NOT EXISTS walkers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Información profesional
    bio TEXT,
    experience_years INTEGER DEFAULT 0,
    certifications TEXT[] DEFAULT '{}',
    
    -- Servicios y precios
    hourly_rate NUMERIC(10, 2),
    services TEXT[] DEFAULT '{}', -- walking, daycare, overnight, training, grooming
    availability_schedule TEXT, -- JSON string con horarios
    max_pets_per_walk INTEGER DEFAULT 3,
    
    -- Ubicación y área de servicio
    city VARCHAR(100),
    neighborhood VARCHAR(100),
    service_radius_km NUMERIC(10, 2),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    
    -- Preferencias de mascotas
    accepted_pet_sizes TEXT[] DEFAULT '{}', -- small, medium, large, giant
    accepted_pet_types TEXT[] DEFAULT '{}', -- dog, cat, other
    
    -- Estado y verificación
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    background_check_completed BOOLEAN DEFAULT FALSE,
    
    -- Estadísticas
    total_walks INTEGER DEFAULT 0,
    rating_average NUMERIC(3, 2),
    total_reviews INTEGER DEFAULT 0,
    
    -- Galería de fotos
    profile_photos TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda eficiente de paseadores
CREATE INDEX IF NOT EXISTS idx_walkers_user_id ON walkers(user_id);
CREATE INDEX IF NOT EXISTS idx_walkers_location ON walkers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_walkers_city ON walkers(city);
CREATE INDEX IF NOT EXISTS idx_walkers_active ON walkers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_walkers_rating ON walkers(rating_average DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_walkers_services ON walkers USING GIN(services);
CREATE INDEX IF NOT EXISTS idx_walkers_pet_types ON walkers USING GIN(accepted_pet_types);
CREATE INDEX IF NOT EXISTS idx_walkers_pet_sizes ON walkers USING GIN(accepted_pet_sizes);

-- ============= WALKER REVIEWS =============
CREATE TABLE IF NOT EXISTS walker_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    walker_id UUID NOT NULL REFERENCES walkers(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Calificación
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Contexto del servicio
    service_type VARCHAR(50) NOT NULL,
    service_date TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraint: un usuario solo puede reseñar a un paseador una vez
    CONSTRAINT unique_walker_reviewer UNIQUE (walker_id, reviewer_id)
);

-- Índices para reseñas
CREATE INDEX IF NOT EXISTS idx_walker_reviews_walker ON walker_reviews(walker_id);
CREATE INDEX IF NOT EXISTS idx_walker_reviews_reviewer ON walker_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_walker_reviews_rating ON walker_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_walker_reviews_created ON walker_reviews(created_at DESC);

-- ============= WALKER BOOKINGS =============
CREATE TABLE IF NOT EXISTS walker_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    walker_id UUID NOT NULL REFERENCES walkers(id) ON DELETE CASCADE,
    pet_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    
    -- Detalles del servicio
    service_type VARCHAR(50) NOT NULL, -- walking, daycare, overnight, training, grooming
    scheduled_date TIMESTAMP NOT NULL,
    duration_hours NUMERIC(5, 2) NOT NULL,
    total_price NUMERIC(10, 2),
    
    -- Estado de la reserva
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para reservas
CREATE INDEX IF NOT EXISTS idx_walker_bookings_walker ON walker_bookings(walker_id);
CREATE INDEX IF NOT EXISTS idx_walker_bookings_owner ON walker_bookings(pet_owner_id);
CREATE INDEX IF NOT EXISTS idx_walker_bookings_pet ON walker_bookings(pet_id);
CREATE INDEX IF NOT EXISTS idx_walker_bookings_status ON walker_bookings(status);
CREATE INDEX IF NOT EXISTS idx_walker_bookings_scheduled ON walker_bookings(scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_walker_bookings_created ON walker_bookings(created_at DESC);

-- ============= FUNCTIONS & TRIGGERS =============

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_walker_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_walker_timestamp
    BEFORE UPDATE ON walkers
    FOR EACH ROW
    EXECUTE FUNCTION update_walker_timestamp();

CREATE TRIGGER trigger_update_booking_timestamp
    BEFORE UPDATE ON walker_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_walker_timestamp();

-- ============= COMMENTS =============
COMMENT ON TABLE walkers IS 'Perfiles de paseadores profesionales';
COMMENT ON TABLE walker_reviews IS 'Reseñas y calificaciones de paseadores';
COMMENT ON TABLE walker_bookings IS 'Reservas de servicios de paseadores';

COMMENT ON COLUMN walkers.services IS 'Tipos de servicios: walking, daycare, overnight, training, grooming';
COMMENT ON COLUMN walkers.availability_schedule IS 'Horarios de disponibilidad en formato JSON';
COMMENT ON COLUMN walkers.accepted_pet_sizes IS 'Tamaños aceptados: small, medium, large, giant';
COMMENT ON COLUMN walkers.accepted_pet_types IS 'Tipos de mascotas: dog, cat, other';
COMMENT ON COLUMN walker_bookings.status IS 'Estados: pending, confirmed, in_progress, completed, cancelled';
