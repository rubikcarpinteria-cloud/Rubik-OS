export type ExchangeRateType = 'oficial' | 'blue' | 'mep' | 'ccl' | 'manual';

export type ExchangeRate = {
  id: string;
  date: string;
  rateType: ExchangeRateType;
  buyArs: number | null;
  sellArs: number;
  source: string | null;
  createdAt: Date;
};

// Future integration point: when Rubik OS connects to a dollar-blue provider,
// the daily sell rate must be stored as rateType = 'blue' and sellArs.
export type ManualExchangeRateInput = {
  date: string;
  rateType: ExchangeRateType;
  buyArs?: number | null;
  sellArs: number;
  source?: string | null;
};
