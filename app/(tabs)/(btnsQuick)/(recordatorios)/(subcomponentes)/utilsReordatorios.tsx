export function getTypeColor(type: string): string {
  const colors = {
    vacuna: '#4CAF50',     
    consulta: '#2196F3',   
    cirugia: '#F44336',     
    revision: '#FF9800',    
    emergencia: '#E91E63',  
    recordatorio: '#9C27B0' 
  };
  return colors[type as keyof typeof colors] || '#47a9ff';
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

export function getTypeName(type: string): string {
  const names = {
    vacuna: 'Vacuna',
    consulta: 'Consulta',
    cirugia: 'Cirugía',
    revision: 'Revisión',
    emergencia: 'Emergencia',
    recordatorio: 'Recordatorio'
  };
  return names[type as keyof typeof names] || 'Evento';
}

export function getTypePriority(type: string): number {
  const priorities = {
    emergencia: 1, 
    cirugia: 2,
    vacuna: 3,
    consulta: 4,
    revision: 5,
    recordatorio: 6 
  };
  return priorities[type as keyof typeof priorities] || 7;
}
export function getDotColor(type: string): string {
  const colors = {
    vacuna: '#66BB6A',     
    consulta: '#42A5F5',   
    cirugia: '#EF5350',    
    revision: '#FFA726',    
    emergencia: '#EC407A',  
    recordatorio: '#AB47BC' 
  };
  return colors[type as keyof typeof colors] || '#47a9ff';
}