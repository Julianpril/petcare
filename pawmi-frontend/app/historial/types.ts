export type HistoryFilterType = 'all' | 'reminders' | 'pets';

export interface HistoryItem {
  id: string;
  type: 'reminder' | 'pet_created' | 'pet_updated';
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
  petName?: string;
  petPhoto?: string;
}
