export interface PlanFeature {
  icon: string;
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  color: string[];
  popular?: boolean;
  features: PlanFeature[];
  badge?: string;
}

export type PeriodType = 'monthly' | 'yearly';

export const getPlans = (selectedPeriod: PeriodType): Plan[] => [
  {
    id: 'basic',
    name: 'Básico',
    price: selectedPeriod === 'monthly' ? 0 : 0,
    period: selectedPeriod === 'monthly' ? 'mes' : 'año',
    color: ['#667eea', '#764ba2'],
    features: [
      { icon: 'paw', text: 'Hasta 3 mascotas', included: true },
      { icon: 'calendar', text: 'Recordatorios básicos', included: true },
      { icon: 'document-text', text: 'Historial médico', included: true },
      { icon: 'notifications', text: 'Notificaciones push', included: true },
      { icon: 'location', text: 'Buscar paseadores', included: true },
      { icon: 'chatbubble', text: 'Soporte por email', included: true },
      { icon: 'shield-checkmark', text: 'Diagnóstico con IA', included: false },
      { icon: 'camera', text: 'Almacenamiento ilimitado', included: false },
      { icon: 'analytics', text: 'Estadísticas avanzadas', included: false },
      { icon: 'people', text: 'Soporte prioritario', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: selectedPeriod === 'monthly' ? 19900 : 199000,
    period: selectedPeriod === 'monthly' ? 'mes' : 'año',
    color: ['#f093fb', '#f5576c'],
    popular: true,
    badge: 'Más Popular',
    features: [
      { icon: 'paw', text: 'Hasta 10 mascotas', included: true },
      { icon: 'calendar', text: 'Recordatorios ilimitados', included: true },
      { icon: 'document-text', text: 'Historial médico completo', included: true },
      { icon: 'notifications', text: 'Notificaciones avanzadas', included: true },
      { icon: 'location', text: 'Paseadores premium', included: true },
      { icon: 'chatbubble', text: 'Chat en vivo', included: true },
      { icon: 'shield-checkmark', text: '5 diagnósticos IA/mes', included: true },
      { icon: 'camera', text: '10GB almacenamiento', included: true },
      { icon: 'analytics', text: 'Estadísticas básicas', included: true },
      { icon: 'people', text: 'Soporte prioritario', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Profesional',
    price: selectedPeriod === 'monthly' ? 49900 : 499000,
    period: selectedPeriod === 'monthly' ? 'mes' : 'año',
    color: ['#4facfe', '#00f2fe'],
    badge: 'Veterinarios',
    features: [
      { icon: 'paw', text: 'Mascotas ilimitadas', included: true },
      { icon: 'calendar', text: 'Agenda profesional', included: true },
      { icon: 'document-text', text: 'Expedientes completos', included: true },
      { icon: 'notifications', text: 'Sistema de recordatorios', included: true },
      { icon: 'location', text: 'Red de paseadores', included: true },
      { icon: 'chatbubble', text: 'Soporte 24/7', included: true },
      { icon: 'shield-checkmark', text: 'Diagnósticos IA ilimitados', included: true },
      { icon: 'camera', text: 'Almacenamiento ilimitado', included: true },
      { icon: 'analytics', text: 'Analytics completos', included: true },
      { icon: 'people', text: 'Múltiples usuarios', included: true },
    ],
  },
];
