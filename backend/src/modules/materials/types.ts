export type MaterialCurrency = 'ARS' | 'USD';

export type MaterialCategory = 'board' | 'edge_band' | 'hardware' | 'service' | 'other';

export type Material = {
  id: string;
  supplier: string;
  brand: string;
  // TODO: define a controlled strategy for custom material categories before allowing free text.
  category: MaterialCategory;
  substrate: string | null;
  name: string;
  color: string | null;
  thicknessMm: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  unit: string;
  priceArs: number;
  currency: MaterialCurrency;
  updatedAt: Date;
  source: string | null;
  active: boolean;
};

export type ProvisionalMaterialSeed = Omit<Material, 'id' | 'updatedAt' | 'active'> & {
  active?: boolean;
};
