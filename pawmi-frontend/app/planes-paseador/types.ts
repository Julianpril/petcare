export interface PlanPaseador {
  id: string;
  name: string;
  commission: number;
  monthlyFee: number;
  period: string;
  color: string[];
  popular?: boolean;
  features: {
    icon: string;
    text: string;
    included: boolean;
  }[];
  badge?: string;
}

export type PeriodType = 'monthly' | 'yearly';
