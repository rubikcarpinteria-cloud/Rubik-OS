export type QuoteStatus =
  | 'borrador'
  | 'preliminar'
  | 'pendiente_validacion_diego'
  | 'validada'
  | 'enviada_cliente'
  | 'señada'
  | 'vencida'
  | 'rechazada'
  | 'convertida_en_proyecto';

export type QuoteCurrency = 'ARS' | 'USD';

export type Quote = {
  id: string;
  clientId: string | null;
  projectId: string | null;
  quoteNumber: string;
  title: string;
  description: string | null;
  status: QuoteStatus;
  currency: QuoteCurrency;
  exchangeRateId: string | null;
  subtotalMaterialsArs: number;
  subtotalHardwareArs: number;
  subtotalServicesArs: number;
  subtotalLaborArs: number;
  wastePercentage: number;
  marginPercentage: number;
  discountArs: number;
  totalArs: number;
  totalUsd: number | null;
  depositPercentage: number;
  depositArs: number;
  depositUsd: number | null;
  validUntil: Date | null;
  frozenAt: Date | null;
  approvedByDiego: boolean;
  approvedByDiegoAt: Date | null;
  notesInternal: string | null;
  notesClient: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type QuoteItemType = 'material' | 'hardware' | 'service' | 'labor' | 'other';

export type QuoteItem = {
  id: string;
  quoteId: string;
  itemType: QuoteItemType;
  description: string;
  quantity: number;
  unit: string;
  unitPriceArs: number;
  totalArs: number;
  notes: string | null;
};

export type QuoteValidityHours = 48 | 72;
