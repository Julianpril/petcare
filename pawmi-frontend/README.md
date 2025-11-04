# 📱 PawMI Frontend

Aplicación móvil de diagnóstico veterinario desarrollada con React Native y Expo.

## 🚀 Tecnologías

- **Framework**: React Native
- **Navegación**: Expo Router (file-based routing)
- **UI Components**: Custom components
- **Estado**: React Hooks
- **TypeScript**: Para type safety

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npx expo start
```

## 🏗️ Estructura del Proyecto

```
pawmi-frontend/
├── app/                    # Screens (file-based routing)
│   ├── _layout.tsx        # Layout principal
│   ├── index.tsx          # Pantalla de inicio
│   ├── login.tsx          # Login
│   ├── register.tsx       # Registro
│   ├── Auth.tsx           # Autenticación
│   └── (tabs)/            # Tab navigation
│       ├── index.tsx      # Home
│       ├── user.tsx       # Perfil de usuario
│       └── petsCacrd.tsx  # Tarjetas de mascotas
│
├── components/            # Componentes reutilizables
│   ├── AddButton.tsx
│   ├── EditPetModal.tsx
│   ├── loader.tsx
│   ├── navbar.tsx
│   └── ui/                # UI components base
│
├── assets/               # Recursos estáticos
│   ├── images/          # Imágenes
│   └── fonts/           # Fuentes
│
├── constants/           # Constantes y configuración
│   └── Colors.ts       # Tema de colores
│
└── hooks/              # Custom React hooks
    └── useColorScheme.ts
```

## 🎨 Características

- ✅ Autenticación de usuarios
- ✅ Gestión de perfil de mascotas
- ✅ Chat con IA veterinaria
- ✅ Sistema de recordatorios
- ✅ Historial médico
- ✅ Modo oscuro/claro

## 🔧 Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Iniciar en web
npm run web

# Reset del proyecto
npm run reset-project

# Lint
npm run lint
```

## 📱 Ejecución en Dispositivos

### Android Emulator
1. Instalar Android Studio
2. Configurar emulador
3. Ejecutar `npm run android`

### iOS Simulator (solo macOS)
1. Instalar Xcode
2. Ejecutar `npm run ios`

### Expo Go (Dispositivo físico)
1. Instalar Expo Go desde App Store/Play Store
2. Escanear QR code desde `npm start`

## 🌐 API Integration

La app se conecta al backend FastAPI:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
```

Configurar en `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## 📚 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript](https://www.typescriptlang.org/)

## 🐛 Troubleshooting

### Puerto ya en uso
```bash
npx expo start --clear
```

### Cache issues
```bash
npx expo start -c
```

### Reinstalar dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```
