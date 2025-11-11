export interface Pet {
  id: string;
  name: string;
  breed?: string;
  imageUrl: string;
}

export interface AppointmentForm {
  petId: string;
  title: string;
  vetName: string;
  location: string;
  notes: string;
  date: Date;
  time: Date;
}
