import { Appointment } from './interfaz';

export const appointments: Appointment[] = [
  {
    id: '1',
    title: 'Vacunación de Luna',
    time: '10:00 AM',
    date: '2025-05-18',
    type: 'vacuna',
    petName: 'Luna',
    description: 'Vacuna anual contra rabia'
  },
  {
    id: '2',
    title: 'Consulta con veterinario',
    time: '02:30 PM',
    date: '2025-05-20',
    type: 'consulta',
    petName: 'Max',
    description: 'Chequeo general de salud'
  },
  {
    id: '3',
    title: 'Revisión post-operatoria',
    time: '11:00 AM',
    date: '2025-05-22',
    type: 'revision',
    petName: 'Bella',
    description: 'Control después de esterilización'
  },
  {
    id: '4',
    title: 'Limpieza dental',
    time: '09:00 AM',
    date: '2025-05-25',
    type: 'consulta',
    petName: 'Rocky',
    description: 'Limpieza dental programada'
  },
  {
    id: '5',
    title: 'Dar medicamento a Luna',
    date: '2025-05-19',
    type: 'recordatorio',
    petName: 'Luna',
    description: 'Administrar antibiótico cada 8 horas'
  },
  {
    id: '6',
    title: 'Comprar comida para Max',
    date: '2025-05-21',
    type: 'recordatorio',
    petName: 'Max',
    description: 'Comprar croquetas especiales'
  }
];