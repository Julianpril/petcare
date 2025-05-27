
export function getTypeColor(type: string): string {
  const colors = {
    vacuna: '#4CAF50',
    consulta: '#2196F3',
    cirugia: '#F44336',
    revision: '#FF9800',
    emergencia: '#E91E63',
    recordatorio: '#9C27B0' 
  };
  return colors[type as keyof typeof colors] || '#2196F3';
}

export function getTypeIcon(type: string): string {
  const icons = {
    vacuna: '💉',
    consulta: '🩺',
    cirugia: '⚕️',
    revision: '🔍',
    emergencia: '🚨',
    recordatorio: '⏰' 
  };
  return icons[type as keyof typeof icons] || '🩺';
}