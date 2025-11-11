export type IoniconName = 
  | 'briefcase'
  | 'person-circle'
  | 'diamond'
  | 'cash'
  | 'calendar'
  | 'star'
  | 'footsteps'
  | 'notifications'
  | 'chevron-forward'
  | 'information-circle'
  | 'add-circle'
  | 'time'
  | 'checkmark-done'
  | 'walk'
  | 'checkmark-circle'
  | 'person-circle-outline';

export interface WalkerStats {
  pending_count: number;
  upcoming_count: number;
  completed_count: number;
  total_earnings: number;
  rating: number;
  total_walks: number;
}

export interface QuickAction {
  id: string;
  icon: IoniconName;
  label: string;
  color: string;
  onPress: () => void;
  show: boolean;
}
