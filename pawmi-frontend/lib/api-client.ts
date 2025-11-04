import AsyncStorage from '@react-native-async-storage/async-storage';

// Configura la URL del backend según el entorno
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  detail: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
  }) {
    return this.post<any>('/auth/register', userData);
  }

  async getCurrentUser() {
    return this.get<any>('/auth/me');
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
}

export const apiClient = new ApiClient(API_BASE_URL);
