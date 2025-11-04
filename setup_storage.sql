-- ============================================
-- CONFIGURACIÓN SUPABASE STORAGE - PET IMAGES
-- Ejecuta este script completo en SQL Editor
-- ============================================

-- 1. CREAR BUCKET (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-images', 
  'pet-images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE SEGURIDAD

-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their pet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their pet images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pet images" ON storage.objects;

-- Permitir SUBIR imágenes (usuarios autenticados)
CREATE POLICY "Users can upload pet images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-images' AND
  (storage.foldername(name))[1] = 'pets'
);

-- Permitir ACTUALIZAR imágenes (usuarios autenticados)
CREATE POLICY "Users can update their pet images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-images')
WITH CHECK (bucket_id = 'pet-images');

-- Permitir ELIMINAR imágenes (usuarios autenticados)
CREATE POLICY "Users can delete their pet images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pet-images');

-- Permitir VER imágenes (público - necesario para mostrarlas)
CREATE POLICY "Anyone can view pet images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-images');

-- 3. VERIFICACIÓN
SELECT 
  'Bucket creado: ' || name as status,
  'Público: ' || public as public_status,
  'Tamaño máximo: ' || file_size_limit || ' bytes' as size_limit
FROM storage.buckets 
WHERE id = 'pet-images';

-- Ver políticas aplicadas
SELECT 
  policyname as "Política",
  roles::text[] as "Roles",
  cmd as "Comando"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%pet images%'
ORDER BY policyname;

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================
-- 
-- Ahora puedes:
-- 1. Subir imágenes desde la app
-- 2. Ver las imágenes en el dashboard
-- 3. Las URLs serán públicas y accesibles
--
-- Estructura de carpetas:
-- pet-images/
--   └── pets/
--       ├── [timestamp]-[random].jpg
--       └── ...
--
-- ============================================
