export interface MenuItem {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress?: () => void;
  isSwitch?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
}

export interface UserStats {
  petsCount: number;
  appointmentsCount: number;
  remindersCount: number;
}
