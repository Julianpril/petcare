export interface Booking {
  id: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    size?: string;
    owner: {
      full_name: string;
      phone?: string;
      email: string;
    };
  };
  service_type: string;
  scheduled_date: string;
  duration_hours: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface Stats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  total_earnings: number;
  average_rating: number;
}

export type TabType = 'pending' | 'upcoming' | 'completed';

export const SERVICE_LABELS: Record<string, string> = {
  walking: '🚶 Paseo',
  daycare: '🏠 Guardería',
  overnight: '🌙 Hospedaje',
  training: '🎓 Entrenamiento',
  grooming: '✂️ Peluquería',
};

export const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pendiente', color: '#f59e0b', icon: 'time' },
  confirmed: { label: 'Confirmada', color: '#10b981', icon: 'checkmark-circle' },
  in_progress: { label: 'En curso', color: '#3b82f6', icon: 'play-circle' },
  completed: { label: 'Completada', color: '#8b5cf6', icon: 'checkmark-done' },
  cancelled: { label: 'Cancelada', color: '#ef4444', icon: 'close-circle' },
};
