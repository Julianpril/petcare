export interface QuickLoginUser {
  email: string;
  password: string;
  role: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
}

export const QUICK_LOGIN_USERS: QuickLoginUser[] = [
  {
    email: 'usuario1@pawmi.com',
    password: 'password123',
    role: 'Usuario',
    icon: 'person',
  },
  {
    email: 'paseador@pawmi.com',
    password: 'walker123',
    role: 'Paseador',
    icon: 'walk',
  },
  {
    email: 'refugio@pawmi.com',
    password: 'shelter123',
    role: 'Refugio',
    icon: 'home',
  },
  {
    email: 'admin@pawmi.com',
    password: 'admin123',
    role: 'Admin',
    icon: 'shield-checkmark',
  },
];
