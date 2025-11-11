import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configura la URL del backend según el entorno
// Para Android usa la IP local de tu PC, para web usa localhost
const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // En Android, localhost no funciona, necesitas la IP de tu PC
  if (Platform.OS === 'android') {
    return 'http://192.168.1.2:8000'; // IP correcta de tu PC
  }
  
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiUrl();

export interface ApiError {
  detail: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    console.log('🌐 ApiClient inicializado con baseUrl:', baseUrl);
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        detail: 'Error en la petición',
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.detail = errorData.detail || errorData.message || error.detail;
      } catch {
        error.detail = response.statusText || error.detail;
      }

      throw error;
    }

    // Si es 204 No Content, no hay body para parsear
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  // Auth endpoints
  async login(email: string, password: string) {
    console.log('🌐 Login usando baseUrl:', this.baseUrl);
    // Backend expects JSON with email field, not form-urlencoded
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error: ApiError = {
        detail: 'Error en el login',
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.detail = errorData.detail || error.detail;
      } catch {
        error.detail = response.statusText || error.detail;
      }

      throw error;
    }

    const data = await response.json();
    await AsyncStorage.setItem('auth_token', data.access_token);
    return data;
  }

  async loginWithGoogle(idToken: string) {
    console.log('🔵 loginWithGoogle - Iniciando petición a:', `${this.baseUrl}/auth/google`);
    console.log('🔵 loginWithGoogle - ID Token recibido:', idToken.substring(0, 50) + '...');
    
    // Crear un timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${this.baseUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('🔵 loginWithGoogle - Response status:', response.status);

      if (!response.ok) {
        const error: ApiError = {
          detail: 'Error al autenticar con Google',
          status: response.status,
        };

        try {
          const errorData = await response.json();
          console.error('❌ loginWithGoogle - Error data:', errorData);
          error.detail = errorData.detail || error.detail;
        } catch {
          error.detail = response.statusText || error.detail;
        }

        throw error;
      }

      const data = await response.json();
      console.log('✅ loginWithGoogle - Token recibido, guardando en AsyncStorage');
      await AsyncStorage.setItem('auth_token', data.access_token);
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('❌ loginWithGoogle - Timeout: No se pudo conectar al servidor');
        throw {
          detail: `No se pudo conectar al servidor en ${this.baseUrl}. Verifica que el backend esté corriendo y la URL sea correcta.`,
          status: 0,
        };
      }
      
      throw error;
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
    role?: 'user' | 'walker' | 'shelter';
  }) {
    return this.post<any>('/auth/register', userData);
  }

  async getCurrentUser() {
    return this.get<any>('/auth/me');
  }

  async updateUserProfile(userId: string, profileData: {
    full_name?: string;
    phone?: string;
    address?: string;
    profile_image_url?: string;
  }) {
    return this.put<any>(`/users/${userId}`, profileData);
  }

  async logout() {
    try {
      // Intentar notificar al servidor (opcional, puede fallar si no hay conexión)
      try {
        await this.post('/auth/logout', {});
      } catch (e) {
        // No importa si falla, igual limpiamos local
        console.log('Logout del servidor falló, pero continuando con limpieza local');
      }
      
      // Limpiar el token local de AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      
      console.log('✅ Token eliminado correctamente');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Aún si hay error, intentar limpiar el token
      try {
        await AsyncStorage.removeItem('auth_token');
      } catch (e) {
        console.error('No se pudo limpiar el token:', e);
      }
    }
  }

  // Pets endpoints
  async getPets() {
    return this.get<any[]>('/pets');
  }

  async getPet(petId: string) {
    return this.get<any>(`/pets/${petId}`);
  }

  async createPet(petData: any) {
    return this.post<any>('/pets', petData);
  }

  async updatePet(petId: string, petData: any) {
    return this.put<any>(`/pets/${petId}`, petData);
  }

  async deletePet(petId: string) {
    return this.delete<any>(`/pets/${petId}`);
  }

  // Reminders endpoints
  async getReminders() {
    return this.get<any[]>('/reminders');
  }

  async getReminder(reminderId: string) {
    return this.get<any>(`/reminders/${reminderId}`);
  }

  async createReminder(reminderData: any) {
    return this.post<any>('/reminders', reminderData);
  }

  async updateReminder(reminderId: string, reminderData: any) {
    return this.put<any>(`/reminders/${reminderId}`, reminderData);
  }

  async deleteReminder(reminderId: string) {
    return this.delete<any>(`/reminders/${reminderId}`);
  }

  async completeReminder(reminderId: string) {
    return this.post<any>(`/reminders/${reminderId}/complete`, {});
  }

  // AI Exercise Routines
  async generateExerciseRoutine(petId: string) {
    return this.post<{ routine: string; pet_name: string }>('/api/ai/generate-exercise-routine', {
      pet_id: petId
    });
  }

  // Breed Classification
  async classifyBreed(imageUri: string) {
    const token = await AsyncStorage.getItem('auth_token');
    
    // Crear FormData para subir la imagen
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'pet_image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${this.baseUrl}/breed/classify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al clasificar raza');
    }

    return response.json();
  }

  // Pet Photos endpoints
  async getPetPhotos(petId: string, category?: string) {
    const endpoint = `/pet-photos/pet/${petId}${category ? `?category=${category}` : ''}`;
    return this.get<any[]>(endpoint);
  }

  async createPetPhoto(photoData: {
    pet_id: string;
    photo_url: string;
    storage_path: string;
    category?: string;
    description?: string;
    treatment_id?: string;
    is_primary?: boolean;
    taken_at?: string;
  }) {
    return this.post<any>('/pet-photos', photoData);
  }

  async updatePetPhoto(photoId: string, photoData: {
    category?: string;
    description?: string;
    is_primary?: boolean;
    taken_at?: string;
  }) {
    return this.put<any>(`/pet-photos/${photoId}`, photoData);
  }

  async deletePetPhoto(photoId: string) {
    return this.delete<any>(`/pet-photos/${photoId}`);
  }

  async getBeforeAfterPhotos(treatmentId: string) {
    return this.get<any>(`/pet-photos/treatment/${treatmentId}/before-after`);
  }

  // ========== WALKER ENDPOINTS ==========
  
  // Buscar paseadores con filtros
  async searchWalkers(filters?: {
    city?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    services?: string[];
    pet_type?: string;
    pet_size?: string;
    latitude?: number;
    longitude?: number;
    max_distance_km?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.city) params.append('city', filters.city);
      if (filters.min_price) params.append('min_price', filters.min_price.toString());
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.min_rating) params.append('min_rating', filters.min_rating.toString());
      if (filters.services) filters.services.forEach(s => params.append('services', s));
      if (filters.pet_type) params.append('pet_type', filters.pet_type);
      if (filters.pet_size) params.append('pet_size', filters.pet_size);
      if (filters.latitude) params.append('latitude', filters.latitude.toString());
      if (filters.longitude) params.append('longitude', filters.longitude.toString());
      if (filters.max_distance_km) params.append('max_distance_km', filters.max_distance_km.toString());
    }
    
    const queryString = params.toString();
    return this.get<any[]>(`/walkers${queryString ? `?${queryString}` : ''}`);
  }

  // Obtener perfil de un paseador específico
  async getWalkerProfile(walkerId: string) {
    return this.get<any>(`/walkers/${walkerId}`);
  }

  // Convertirse en paseador (crear perfil)
  async becomeWalker(walkerData: {
    bio?: string;
    experience_years?: number;
    certifications?: string[];
    hourly_rate: number;
    services: string[];
    availability_schedule?: any;
    city: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    service_radius_km?: number;
    accepted_pet_sizes?: string[];
    accepted_pet_types?: string[];
  }) {
    return this.post<any>('/walkers', walkerData);
  }

  // Actualizar perfil de paseador
  async updateWalkerProfile(walkerId: string, walkerData: any) {
    return this.put<any>(`/walkers/${walkerId}`, walkerData);
  }

  // Obtener mi perfil de paseador
  async getMyWalkerProfile() {
    return this.get<any>('/walkers/me');
  }

  // Obtener reseñas de un paseador
  async getWalkerReviews(walkerId: string) {
    return this.get<any[]>(`/walkers/${walkerId}/reviews`);
  }

  // Crear reseña para un paseador
  async createWalkerReview(walkerId: string, reviewData: {
    rating: number;
    comment?: string;
    service_type: string;
    service_date?: string;
  }) {
    return this.post<any>(`/walkers/${walkerId}/reviews`, reviewData);
  }

  // Crear reserva con un paseador
  async createWalkerBooking(bookingData: {
    walker_id: string;
    pet_id: string;
    service_type: string;
    scheduled_date: string;
    duration_hours: number;
    notes?: string;
  }) {
    return this.post<any>('/walkers/bookings', bookingData);
  }

  // Obtener mis reservas (como cliente o como paseador)
  async getMyBookings(asWalker: boolean = false) {
    return this.get<any[]>(`/walkers/bookings?as_walker=${asWalker}`);
  }

  // Obtener detalles de una reserva
  async getBookingDetails(bookingId: string) {
    return this.get<any>(`/walkers/bookings/${bookingId}`);
  }

  // Actualizar estado de reserva
  async updateBookingStatus(bookingId: string, status: string) {
    return this.put<any>(`/walkers/bookings/${bookingId}`, { status });
  }

  // Subir imagen al servidor
  async uploadImage(uri: string, folder: string = 'pets'): Promise<{ publicUrl: string; path: string }> {
    const token = await AsyncStorage.getItem('auth_token');
    
    // Crear FormData para enviar la imagen
    const formData = new FormData();
    
    // Obtener extensión del archivo
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    
    // @ts-ignore - FormData acepta blobs en React Native
    formData.append('file', {
      uri,
      name: fileName,
      type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
    });
    
    formData.append('folder', folder);

    const response = await fetch(`${this.baseUrl}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error al subir imagen' }));
      throw new Error(error.detail || 'Error al subir imagen');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
