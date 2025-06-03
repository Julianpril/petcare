import { Appointment } from './interfaz';

const getDateString = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const appointments: Appointment[] = [
  {
    id: '1',
    title: 'Vacunación de Luna',
    time: '10:00 AM',
    date: getDateString(2),
    type: 'vacuna',
    petName: 'Luna',
    description: 'Vacuna anual contra rabia'
  },
  {
    id: '2',
    title: 'Consulta con veterinario',
    time: '02:30 PM',
    date: getDateString(5), 
    type: 'consulta',
    petName: 'Max',
    description: 'Chequeo general de salud'
  },
  {
    id: '3',
    title: 'Revisión post-operatoria',
    time: '11:00 AM',
    date: getDateString(8),
    type: 'revision',
    petName: 'Bella',
    description: 'Control después de esterilización'
  },
  {
    id: '4',
    title: 'Limpieza dental',
    time: '09:00 AM',
    date: getDateString(12),
    type: 'consulta',
    petName: 'Rocky',
    description: 'Limpieza dental programada'
  },
  {
    id: '5',
    title: 'Dar medicamento a Luna',
    date: getDateString(1),
    type: 'recordatorio',
    petName: 'Luna',
    description: 'Administrar antibiótico cada 8 horas'
  },
  {
    id: '6',
    title: 'Comprar comida para Max',
    date: getDateString(3),
    type: 'recordatorio',
    petName: 'Max',
    description: 'Comprar croquetas especiales'
  },
  {
    id: '7',
    title: 'Baño y peluquería',
    time: '03:00 PM',
    date: getDateString(7), 
    type: 'consulta',
    petName: 'Luna',
    description: 'Baño mensual y corte de uñas'
  },
  {
    id: '8',
    title: 'Cita de emergencia',
    time: '08:00 AM',
    date: getDateString(0),
    type: 'emergencia',
    petName: 'Max',
    description: 'Revisar herida en la pata'
  },
  {
    id: '9',
    title: 'Recordatorio vitaminas',
    date: getDateString(4), 
    type: 'recordatorio',
    petName: 'Bella',
    description: 'Dar vitaminas después del desayuno'
  },
  {
    id: '10',
    title: 'Cirugía programada',
    time: '09:30 AM',
    date: getDateString(15), 
    type: 'cirugia',
    petName: 'Rocky',
    description: 'Extracción de tumor benigno'
  }
];