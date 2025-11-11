import type { Ionicons } from '@expo/vector-icons';

export type UserRole = 'user' | 'walker' | 'shelter';

export interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
}

export interface RoleOption {
  value: UserRole;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

export interface InputConfig {
  field: keyof FormData;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  autoCapitalize?: 'none' | 'words';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secure?: boolean;
  optional?: boolean;
}

export const INITIAL_FORM_DATA: FormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  phone: '',
};

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'user',
    label: 'Usuario',
    icon: 'person',
    description: 'Dueño de mascota',
    color: '#667eea',
  },
  {
    value: 'walker',
    label: 'Paseador',
    icon: 'walk',
    description: 'Ofrecer servicios',
    color: '#10b981',
  },
  {
    value: 'shelter',
    label: 'Refugio',
    icon: 'home',
    description: 'Organización',
    color: '#f59e0b',
  },
];

export const INPUT_CONFIGS: InputConfig[] = [
  { field: 'fullName', placeholder: 'Nombre completo', icon: 'person', autoCapitalize: 'words' },
  { field: 'username', placeholder: 'Usuario', icon: 'person-circle', autoCapitalize: 'none' },
  {
    field: 'email',
    placeholder: 'Email',
    icon: 'mail',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    field: 'phone',
    placeholder: 'Teléfono (opcional)',
    icon: 'call',
    keyboardType: 'phone-pad',
    optional: true,
    autoCapitalize: 'none',
  },
  { field: 'password', placeholder: 'Contraseña', icon: 'lock-closed', secure: true, autoCapitalize: 'none' },
  {
    field: 'confirmPassword',
    placeholder: 'Confirmar contraseña',
    icon: 'lock-closed',
    secure: true,
    autoCapitalize: 'none',
  },
];

export function validateForm(formData: FormData): Partial<Record<keyof FormData, string>> {
  const errors: Partial<Record<keyof FormData, string>> = {};

  if (!formData.username.trim()) errors.username = 'Requerido';
  else if (formData.username.length < 3) errors.username = 'Mínimo 3 caracteres';

  if (!formData.email.trim()) errors.email = 'Requerido';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'No válido';

  if (!formData.password.trim()) errors.password = 'Requerida';
  else if (formData.password.length < 6) errors.password = 'Mínimo 6 caracteres';

  if (!formData.confirmPassword.trim()) errors.confirmPassword = 'Requerida';
  else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'No coinciden';

  if (!formData.fullName.trim()) errors.fullName = 'Requerido';

  return errors;
}
