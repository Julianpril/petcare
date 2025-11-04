import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export interface UploadImageResult {
  publicUrl: string;
  path: string;
}

/**
 * Sube una imagen a Supabase Storage
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
    // Generar nombre único para el archivo
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Leer el archivo como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Convertir base64 a ArrayBuffer
    const arrayBuffer = decode(base64);

    // Determinar el content type
    const contentType = getContentType(fileExt);

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Error uploading to Supabase:', error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      publicUrl: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    throw error;
  }
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
