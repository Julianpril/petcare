export interface Pet {
  id: string;
  name: string;
  breed?: string;
  imageUrl: string;
  age?: string;
  weight?: string;
  traits?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ReminderForm {
  petId: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  categoria: string;
}

export const categorias: Category[] = [
  { id: 'vacuna', name: 'Vacuna', icon: 'shield', color: '#f093fb' },
  { id: 'desparasitacion', name: 'Desparasitación', icon: 'heart', color: '#43e97b' },
  { id: 'consulta', name: 'Consulta veterinaria', icon: 'user-check', color: '#667eea' },
  { id: 'peluqueria', name: 'Peluquería', icon: 'scissors', color: '#fa709a' },
  { id: 'alimento', name: 'Compra de alimento', icon: 'shopping-bag', color: '#8b5cf6' },
  { id: 'paseo', name: 'Paseo', icon: 'map-pin', color: '#4facfe' },
  { id: 'otro', name: 'Otro', icon: 'more-horizontal', color: '#94a3b8' },
];
