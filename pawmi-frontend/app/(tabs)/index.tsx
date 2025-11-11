import React from 'react';
import { useAuth } from '../../lib/auth-context';
import RefugioHomeScreen from './refugioIndex';
import UserHomeScreen from './userIndex';
import WalkerHomeScreen from './walkerIndex';

export default function HomeScreen() {
  const { currentUser } = useAuth();

  // Si es un paseador, mostrar dashboard de paseador
  if (currentUser?.role === 'walker') {
    return <WalkerHomeScreen />;
  }

  // Si es un refugio, mostrar la pantalla de refugio
  if (currentUser?.role === 'shelter') {
    return <RefugioHomeScreen />;
  }

  // Si es usuario normal o admin, mostrar la pantalla estándar
  return <UserHomeScreen />;
}
