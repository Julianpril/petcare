-- ============================================
-- EXPORTAR DATOS DE SUPABASE
-- Ejecuta este script conectado a Supabase para exportar tus datos
-- ============================================

-- Para ejecutar:
-- $env:PGPASSWORD="PawMi2502.."; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h db.jnttxcptkmokdwglxqpu.supabase.co -d postgres -f export_supabase_data.sql

\echo '=== EXPORTANDO USUARIOS ==='
\copy (SELECT id, email, username, password_hash, full_name, role, is_active, google_id, picture, created_at, updated_at FROM users) TO 'supabase_users.csv' WITH CSV HEADER;

\echo '=== EXPORTANDO MASCOTAS ==='
\copy (SELECT id, owner_id, name, species, breed, age, age_years, weight, weight_kg, gender, color, image_url, array_to_string(traits, '|') as traits, medical_history, created_at, updated_at FROM pets) TO 'supabase_pets.csv' WITH CSV HEADER;

\echo '=== EXPORTANDO RECORDATORIOS ==='
\copy (SELECT id, pet_id, user_id, category, title, description, start_date, time, is_completed, created_at, updated_at FROM reminders) TO 'supabase_reminders.csv' WITH CSV HEADER;

\echo '=== DATOS EXPORTADOS EXITOSAMENTE ==='
\echo 'Archivos creados:'
\echo '  - supabase_users.csv'
\echo '  - supabase_pets.csv'
\echo '  - supabase_reminders.csv'
