import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { apiClient } from './api-client';
import { supabase } from './supabase';

export interface UploadImageResult {
  publicUrl: string;
  path: string;
}

/**
 * Sube una imagen a Supabase Storage o al backend como fallback
 * @param uri - URI local de la imagen (file:// o content://)
 * @param bucket - Nombre del bucket en Supabase (default: 'pet-images')
 * @param folder - Carpeta dentro del bucket (default: 'pets')
 * @returns URL pública de la imagen subida
 */
export async function uploadImageToSupabase(
  uri: string,
  bucket: string = 'pet-images',
  folder: string = 'pets'
): Promise<UploadImageResult> {
  try {
    console.log('=== Iniciando subida de imagen ===');
    console.log('URI:', uri);
    console.log('Bucket:', bucket);
    console.log('Folder:', folder);

    // Check if running on web
    if (Platform.OS === 'web') {
      throw new Error('La subida de imágenes no está disponible en la versión web. Por favor usa la app móvil.');
    }

    // Intentar primero subir a través del backend (más confiable)
    try {
      console.log('📤 Intentando subir vía backend API...');
      const result = await apiClient.uploadImage(uri, folder);
      console.log('✅ Imagen subida exitosamente vía backend:', result.publicUrl);
      return result;
    } catch (backendError) {
      console.warn('⚠️ Error al subir vía backend, intentando con Supabase directo:', backendError);
      
      // Fallback a Supabase directo
      return await uploadDirectlyToSupabase(uri, bucket, folder);
    }
  } catch (error) {
    console.error('❌ Error in uploadImageToSupabase:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al subir la imagen');
  }
}

/**
 * Sube directamente a Supabase Storage (fallback)
 */
async function uploadDirectlyToSupabase(
  uri: string,
  bucket: string,
  folder: string
): Promise<UploadImageResult> {
  console.log('📤 Subiendo directamente a Supabase Storage...');
  
  // Generar nombre único para el archivo
  const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  console.log('File path:', filePath);
  console.log('File extension:', fileExt);

  // Leer el archivo como base64
  console.log('Leyendo archivo...');
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });
  console.log('Archivo leído, tamaño:', base64.length, 'caracteres');

  // Convertir base64 a ArrayBuffer
  console.log('Convirtiendo a ArrayBuffer...');
  const arrayBuffer = decode(base64);
  console.log('ArrayBuffer creado, tamaño:', arrayBuffer.byteLength, 'bytes');

  // Determinar el content type
  const contentType = getContentType(fileExt);
  console.log('Content type:', contentType);

  // Subir a Supabase Storage
  console.log('Subiendo a Supabase Storage...');
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('❌ Error uploading to Supabase:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }

  console.log('✅ Imagen subida exitosamente:', data);

  // Obtener URL pública
  console.log('Obteniendo URL pública...');
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  console.log('URL pública obtenida:', publicUrlData.publicUrl);

  return {
    publicUrl: publicUrlData.publicUrl,
    path: filePath,
  };
}

/**
 * Elimina una imagen de Supabase Storage
 * @param path - Ruta del archivo en Storage
 * @param bucket - Nombre del bucket
 */
export async function deleteImageFromSupabase(
  path: string,
  bucket: string = 'pet-images'
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting from Supabase:', error);
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteImageFromSupabase:', error);
    throw error;
  }
}

/**
 * Determina el content type basado en la extensión del archivo
 */
function getContentType(extension: string): string {
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  return types[extension.toLowerCase()] || 'image/jpeg';
}

/**
 * Extrae el path de una URL de Supabase Storage
 * Útil para eliminar imágenes cuando tienes la URL completa
 */
export function extractPathFromSupabaseUrl(url: string): string | null {
  try {
    // Formato: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
