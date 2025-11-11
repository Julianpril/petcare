-- ============================================
-- PAWMI - ESQUEMA DE BASE DE DATOS SUPABASE
-- Sistema de gestión veterinaria de mascotas
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA: users (Usuarios/Dueños de mascotas)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    profile_image_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'shelter')),
    is_active BOOLEAN DEFAULT true,
    
    -- Campos específicos para refugios
    shelter_name VARCHAR(255),
    shelter_description TEXT,
    shelter_license VARCHAR(100),
    is_verified_shelter BOOLEAN DEFAULT false,
    
    -- Google OAuth
    google_id VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50) DEFAULT 'local',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_shelter ON users(role, is_verified_shelter) WHERE role = 'shelter';

-- ============================================
-- TABLA: pets (Mascotas)
-- ============================================
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL CHECK (species IN ('Dog', 'Cat', 'Bird', 'Rabbit', 'Other')),
    breed VARCHAR(100),
    age VARCHAR(20), -- Formato: "2 años", "6 meses"
    age_years DECIMAL(4,1), -- Edad calculada en años
    weight VARCHAR(20), -- Formato: "15 kg"
    weight_kg DECIMAL(6,2), -- Peso en kilogramos
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Unknown')),
    color VARCHAR(100),
    microchip_id VARCHAR(50),
    image_url TEXT,
    medical_history TEXT,
    allergies TEXT[],
    traits TEXT[], -- Características/personalidad: ["juguetón", "cariñoso", etc]
    is_active BOOLEAN DEFAULT true,
    
    -- Campos para adopción (refugios)
    is_for_adoption BOOLEAN DEFAULT false,
    adoption_status VARCHAR(50) CHECK (adoption_status IN ('available', 'pending', 'adopted')),
    adoption_fee DECIMAL(10,2),
    adoption_requirements TEXT,
    sterilized BOOLEAN,
    vaccinated BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para pets
CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_adoption ON pets(is_for_adoption, adoption_status) WHERE is_for_adoption = true;
CREATE INDEX idx_pets_active ON pets(is_active);

-- ============================================
-- TABLA: reminders (Recordatorios)
-- ============================================
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'vacuna', 'desparasitacion', 'consulta', 
        'peluqueria', 'alimento', 'paseo', 'otro'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    time TIME,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'yearly'
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para reminders
CREATE INDEX idx_reminders_pet ON reminders(pet_id);
CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_date ON reminders(start_date);
CREATE INDEX idx_reminders_category ON reminders(category);
CREATE INDEX idx_reminders_completed ON reminders(is_completed);

-- ============================================
-- TABLA: feeding_schedule (Horarios de comida)
-- ============================================
CREATE TABLE feeding_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    meal_time TIME NOT NULL,
    meal_type VARCHAR(50) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_type VARCHAR(100),
    portion_size VARCHAR(50),
    portion_grams DECIMAL(8,2),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para feeding_schedule
CREATE INDEX idx_feeding_pet ON feeding_schedule(pet_id);
CREATE INDEX idx_feeding_active ON feeding_schedule(is_active);

-- ============================================
-- TABLA: feeding_logs (Registro de alimentación)
-- ============================================
CREATE TABLE feeding_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES feeding_schedule(id) ON DELETE SET NULL,
    fed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    portion_given VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para feeding_logs
CREATE INDEX idx_feeding_logs_pet ON feeding_logs(pet_id);
CREATE INDEX idx_feeding_logs_date ON feeding_logs(fed_at);

-- ============================================
-- TABLA: health_records (Registros de salud)
-- ============================================
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN (
        'consultation', 'vaccination', 'deworming', 
        'surgery', 'injury', 'illness', 'checkup', 'test'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis TEXT,
    symptoms TEXT[],
    temperature DECIMAL(4,2),
    weight_at_visit DECIMAL(6,2),
    veterinarian_name VARCHAR(255),
    clinic_name VARCHAR(255),
    visit_date DATE NOT NULL,
    next_visit_date DATE,
    prescriptions TEXT,
    attachments TEXT[], -- URLs de documentos/imágenes
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para health_records
CREATE INDEX idx_health_records_pet ON health_records(pet_id);
CREATE INDEX idx_health_records_type ON health_records(record_type);
CREATE INDEX idx_health_records_date ON health_records(visit_date);

-- ============================================
-- TABLA: vaccinations (Vacunas)
-- ============================================
CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    health_record_id UUID REFERENCES health_records(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_type VARCHAR(100),
    batch_number VARCHAR(100),
    administered_date DATE NOT NULL,
    next_due_date DATE,
    veterinarian_name VARCHAR(255),
    clinic_name VARCHAR(255),
    side_effects TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para vaccinations
CREATE INDEX idx_vaccinations_pet ON vaccinations(pet_id);
CREATE INDEX idx_vaccinations_due ON vaccinations(next_due_date);

-- ============================================
-- TABLA: symptoms (Síntomas reportados)
-- ============================================
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symptoms TEXT[] NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
    duration VARCHAR(100), -- "2 días", "1 semana"
    description TEXT,
    temperature DECIMAL(4,2),
    appetite VARCHAR(50) CHECK (appetite IN ('normal', 'increased', 'decreased', 'none')),
    energy_level VARCHAR(50) CHECK (energy_level IN ('normal', 'high', 'low', 'very_low')),
    behavior_changes TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para symptoms
CREATE INDEX idx_symptoms_pet ON symptoms(pet_id);
CREATE INDEX idx_symptoms_date ON symptoms(reported_at);
CREATE INDEX idx_symptoms_resolved ON symptoms(is_resolved);

-- ============================================
-- TABLA: diagnoses (Diagnósticos ML)
-- ============================================
CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symptom_id UUID REFERENCES symptoms(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    predicted_disease VARCHAR(255) NOT NULL,
    confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
    model_version VARCHAR(50),
    input_features JSONB, -- Datos enviados al modelo
    raw_prediction JSONB, -- Respuesta completa del modelo
    recommendations TEXT[],
    urgency_level VARCHAR(20) CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
    requires_vet_visit BOOLEAN DEFAULT false,
    veterinarian_confirmed BOOLEAN DEFAULT false,
    confirmed_diagnosis VARCHAR(255),
    vet_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para diagnoses
CREATE INDEX idx_diagnoses_pet ON diagnoses(pet_id);
CREATE INDEX idx_diagnoses_symptom ON diagnoses(symptom_id);
CREATE INDEX idx_diagnoses_urgency ON diagnoses(urgency_level);
CREATE INDEX idx_diagnoses_date ON diagnoses(created_at);

-- ============================================
-- TABLA: chat_conversations (Conversaciones de salud)
-- ============================================
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    title VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para chat_conversations
CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_pet ON chat_conversations(pet_id);

-- ============================================
-- TABLA: chat_messages (Mensajes del chat de salud)
-- ============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'assistant', 'system')),
    message_text TEXT NOT NULL,
    metadata JSONB, -- Datos adicionales (referencias a diagnósticos, etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para chat_messages
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_date ON chat_messages(created_at);

-- ============================================
-- TABLA: notifications (Notificaciones push)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'reminder', 'health_alert', 'feeding', 'appointment', 'general'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_to VARCHAR(255), -- URL o ruta interna de la app
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);

-- ============================================
-- TABLA: ml_training_data (Datos para entrenamiento ML)
-- ============================================
CREATE TABLE ml_training_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    animal_name VARCHAR(100),
    species VARCHAR(50),
    breed VARCHAR(100),
    age_years DECIMAL(4,1),
    weight_kg DECIMAL(6,2),
    medical_history TEXT,
    symptom_1 VARCHAR(255),
    symptom_2 VARCHAR(255),
    symptom_3 VARCHAR(255),
    symptom_4 VARCHAR(255),
    symptom_5 VARCHAR(255),
    temperature DECIMAL(4,2),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    diagnosed_disease VARCHAR(255),
    diagnosis_confirmed BOOLEAN DEFAULT false,
    data_source VARCHAR(50) DEFAULT 'user_input', -- 'user_input', 'veterinarian', 'synthetic'
    is_validated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ml_training_data
CREATE INDEX idx_ml_training_species ON ml_training_data(species);
CREATE INDEX idx_ml_training_disease ON ml_training_data(diagnosed_disease);
CREATE INDEX idx_ml_training_validated ON ml_training_data(is_validated);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feeding_schedule_updated_at BEFORE UPDATE ON feeding_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON vaccinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diagnoses_updated_at BEFORE UPDATE ON diagnoses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Los usuarios solo pueden ver/modificar sus propios datos

-- Users: Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Pets: Usuarios solo ven sus propias mascotas
CREATE POLICY "Users can view own pets"
    ON pets FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own pets"
    ON pets FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own pets"
    ON pets FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own pets"
    ON pets FOR DELETE
    USING (auth.uid() = owner_id);

-- Reminders: Usuarios solo ven sus recordatorios
CREATE POLICY "Users can view own reminders"
    ON reminders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reminders"
    ON reminders FOR ALL
    USING (auth.uid() = user_id);

-- Similar para otras tablas...
CREATE POLICY "Users can view own feeding schedules"
    ON feeding_schedule FOR SELECT
    USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = feeding_schedule.pet_id AND pets.owner_id = auth.uid()));

CREATE POLICY "Users can manage own feeding schedules"
    ON feeding_schedule FOR ALL
    USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = feeding_schedule.pet_id AND pets.owner_id = auth.uid()));

CREATE POLICY "Users can view own health records"
    ON health_records FOR SELECT
    USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.owner_id = auth.uid()));

CREATE POLICY "Users can manage own health records"
    ON health_records FOR ALL
    USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.owner_id = auth.uid()));

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - Para testing)
-- ============================================

-- Insertar usuario de prueba (la contraseña debe hashearse en la aplicación)
-- INSERT INTO users (email, username, password_hash, full_name, role) VALUES
-- ('test@pawmi.com', 'testuser', crypt('test123', gen_salt('bf')), 'Usuario de Prueba', 'user');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Resumen de mascotas con próximas citas
CREATE OR REPLACE VIEW pets_with_upcoming_reminders AS
SELECT 
    p.id as pet_id,
    p.name,
    p.species,
    p.breed,
    p.owner_id,
    r.id as reminder_id,
    r.category,
    r.title as reminder_title,
    r.start_date,
    r.is_completed
FROM pets p
LEFT JOIN reminders r ON p.id = r.pet_id
WHERE r.start_date >= CURRENT_DATE
  AND r.is_completed = false
ORDER BY r.start_date ASC;

-- Vista: Historial de salud completo
CREATE OR REPLACE VIEW pet_health_summary AS
SELECT 
    p.id as pet_id,
    p.name,
    p.species,
    p.breed,
    p.age,
    p.weight,
    COUNT(DISTINCT hr.id) as total_visits,
    COUNT(DISTINCT v.id) as total_vaccinations,
    COUNT(DISTINCT s.id) as total_symptoms_reported,
    COUNT(DISTINCT d.id) as total_diagnoses,
    MAX(hr.visit_date) as last_vet_visit
FROM pets p
LEFT JOIN health_records hr ON p.id = hr.pet_id
LEFT JOIN vaccinations v ON p.id = v.pet_id
LEFT JOIN symptoms s ON p.id = s.pet_id
LEFT JOIN diagnoses d ON p.id = d.pet_id
GROUP BY p.id, p.name, p.species, p.breed, p.age, p.weight;

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE users IS 'Usuarios/dueños de mascotas registrados en la aplicación';
COMMENT ON TABLE pets IS 'Mascotas registradas por los usuarios';
COMMENT ON TABLE reminders IS 'Recordatorios de citas, vacunas, etc.';
COMMENT ON TABLE feeding_schedule IS 'Horarios programados de alimentación';
COMMENT ON TABLE feeding_logs IS 'Registro histórico de alimentación real';
COMMENT ON TABLE health_records IS 'Historial médico veterinario completo';
COMMENT ON TABLE vaccinations IS 'Registro de vacunas aplicadas';
COMMENT ON TABLE symptoms IS 'Síntomas reportados por los usuarios';
COMMENT ON TABLE diagnoses IS 'Diagnósticos generados por el modelo ML';
COMMENT ON TABLE chat_conversations IS 'Conversaciones del chat de salud con IA';
COMMENT ON TABLE notifications IS 'Notificaciones push enviadas a usuarios';
COMMENT ON TABLE ml_training_data IS 'Datos recopilados para reentrenamiento del modelo ML';

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
