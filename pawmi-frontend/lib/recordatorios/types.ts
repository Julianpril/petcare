export interface Appointment {
  id: string;
  title: string;
  time?: string;
  date: string;
  type:
    | 'vacuna'
    | 'consulta'
    | 'cirugia'
    | 'revision'
    | 'emergencia'
    | 'recordatorio'
    | 'desparasitacion'
    | 'peluqueria'
    | 'alimento'
    | 'paseo'
    | 'otro';
  petName: string;
  description?: string;
}

export interface CalendarComponentProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  appointments: Appointment[];
}

export interface AppointmentsListProps {
  selectedDate: string;
  appointments: Appointment[];
}

export interface AppointmentCardProps {
  appointment: Appointment;
  showDate?: boolean;
}

export interface AddButtonProps {
  onPress: () => void;
}
