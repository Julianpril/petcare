export type AdoptionStats = {
  total: number;
  available: number;
  pending: number;
  adopted: number;
  thisMonth: number;
  thisYear: number;
};

export type PetBreedStats = {
  breed: string;
  count: number;
  percentage: number;
};
