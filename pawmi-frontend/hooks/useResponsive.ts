/**
 * Hook para diseño responsivo basado en dimensiones de pantalla
 * Se actualiza automáticamente cuando cambia la orientación
 */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge';
export type Orientation = 'portrait' | 'landscape';

interface ResponsiveValues {
  // Dimensiones
  width: number;
  height: number;
  
  // Orientación
  isPortrait: boolean;
  isLandscape: boolean;
  orientation: Orientation;
  
  // Tamaños de pantalla
  isSmall: boolean;      // < 375px (iPhone SE, pequeños Android)
  isMedium: boolean;     // 375-768px (iPhone normal, Android normal)
  isLarge: boolean;      // 768-1024px (iPad, tablets)
  isXLarge: boolean;     // > 1024px (iPad Pro, desktop)
  screenSize: ScreenSize;
  
  // Helpers para padding/margin responsivos
  spacing: {
    xs: number;   // 4, 6, 8
    sm: number;   // 8, 12, 16
    md: number;   // 16, 20, 24
    lg: number;   // 24, 32, 40
    xl: number;   // 32, 40, 48
  };
  
  // Helpers para fuentes responsivas
  fontSize: {
    xs: number;   // 10, 11, 12
    sm: number;   // 12, 13, 14
    md: number;   // 14, 16, 18
    lg: number;   // 18, 20, 24
    xl: number;   // 24, 28, 32
    xxl: number;  // 32, 36, 40
  };
  
  // Número de columnas para grids
  columns: number;
}

const BREAKPOINTS = {
  small: 375,
  medium: 768,
  large: 1024,
};

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();
  
  return useMemo(() => {
    // Orientación
    const isPortrait = height > width;
    const isLandscape = width > height;
    const orientation: Orientation = isPortrait ? 'portrait' : 'landscape';
    
    // Tamaños de pantalla
    const isSmall = width < BREAKPOINTS.small;
    const isMedium = width >= BREAKPOINTS.small && width < BREAKPOINTS.medium;
    const isLarge = width >= BREAKPOINTS.medium && width < BREAKPOINTS.large;
    const isXLarge = width >= BREAKPOINTS.large;
    
    let screenSize: ScreenSize;
    if (isSmall) screenSize = 'small';
    else if (isMedium) screenSize = 'medium';
    else if (isLarge) screenSize = 'large';
    else screenSize = 'xlarge';
    
    // Spacing responsivo (más pequeño en pantallas pequeñas)
    const baseSpacing = {
      xs: isSmall ? 4 : isMedium ? 6 : 8,
      sm: isSmall ? 8 : isMedium ? 12 : 16,
      md: isSmall ? 16 : isMedium ? 20 : 24,
      lg: isSmall ? 24 : isMedium ? 32 : 40,
      xl: isSmall ? 32 : isMedium ? 40 : 48,
    };
    
    // Font sizes responsivos
    const baseFontSize = {
      xs: isSmall ? 10 : isMedium ? 11 : 12,
      sm: isSmall ? 12 : isMedium ? 13 : 14,
      md: isSmall ? 14 : isMedium ? 16 : 18,
      lg: isSmall ? 18 : isMedium ? 20 : 24,
      xl: isSmall ? 24 : isMedium ? 28 : 32,
      xxl: isSmall ? 32 : isMedium ? 36 : 40,
    };
    
    // Columnas para grids (más en landscape y pantallas grandes)
    let columns = 1;
    if (isLandscape) {
      columns = isSmall ? 2 : isMedium ? 3 : 4;
    } else {
      columns = isSmall ? 1 : isMedium ? 2 : 3;
    }
    
    return {
      width,
      height,
      isPortrait,
      isLandscape,
      orientation,
      isSmall,
      isMedium,
      isLarge,
      isXLarge,
      screenSize,
      spacing: baseSpacing,
      fontSize: baseFontSize,
      columns,
    };
  }, [width, height]);
}

/**
 * Hook simplificado para obtener solo el tamaño de pantalla
 */
export function useScreenSize(): ScreenSize {
  const { screenSize } = useResponsive();
  return screenSize;
}

/**
 * Hook para obtener la orientación
 */
export function useOrientation(): Orientation {
  const { orientation } = useResponsive();
  return orientation;
}
