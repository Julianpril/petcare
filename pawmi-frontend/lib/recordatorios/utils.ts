export function getTypeColor(type: string): string {
  const colors = {
    vacuna: '#4CAF50',
    consulta: '#2196F3',
    cirugia: '#F44336',
    revision: '#FF9800',
    emergencia: '#E91E63',
    recordatorio: '#9C27B0',
    desparasitacion: '#8BC34A',
    peluqueria: '#FFC107',
    alimento: '#795548',
    paseo: '#03A9F4',
    otro: '#607D8B',
  } as const;
  return colors[type as keyof typeof colors] || '#47a9ff';
}

export function getTypeIcon(type: string): string {
  const icons = {
    vacuna: '💉',
    consulta: '🩺',
    cirugia: '⚕️',
    revision: '🔍',
    emergencia: '🚨',
    recordatorio: '⏰',
    desparasitacion: '🛡️',
    peluqueria: '✂️',
    alimento: '🍽️',
    paseo: '🐕',
    otro: '📌',
  } as const;
  return icons[type as keyof typeof icons] || '🩺';
}

export function getTypeName(type: string): string {
  const names = {
    vacuna: 'Vacuna',
    consulta: 'Consulta',
    cirugia: 'Cirugía',
    revision: 'Revisión',
    emergencia: 'Emergencia',
    recordatorio: 'Recordatorio',
    desparasitacion: 'Desparasitación',
    peluqueria: 'Peluquería',
    alimento: 'Alimento',
    paseo: 'Paseo',
    otro: 'Otro',
  } as const;
  return names[type as keyof typeof names] || 'Evento';
}

export function getTypePriority(type: string): number {
  const priorities = {
    emergencia: 1,
    cirugia: 2,
    vacuna: 3,
    consulta: 4,
    revision: 5,
    desparasitacion: 3,
    recordatorio: 6,
    peluqueria: 7,
    alimento: 8,
    paseo: 9,
    otro: 10,
  } as const;
  return priorities[type as keyof typeof priorities] || 7;
}

export function getDotColor(type: string): string {
  const colors = {
    vacuna: '#66BB6A',
    consulta: '#42A5F5',
    cirugia: '#EF5350',
    revision: '#FFA726',
    emergencia: '#EC407A',
    recordatorio: '#AB47BC',
    desparasitacion: '#AED581',
    peluqueria: '#FFD54F',
    alimento: '#A1887F',
    paseo: '#4FC3F7',
    otro: '#90A4AE',
  } as const;
  return colors[type as keyof typeof colors] || '#47a9ff';
}
