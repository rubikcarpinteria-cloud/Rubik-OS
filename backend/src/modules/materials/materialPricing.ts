import type { ProvisionalMaterialSeed } from './types.js';

export const PROVISIONAL_FAPLAC_MATERIALS: readonly ProvisionalMaterialSeed[] = [
  {
    supplier: 'Faplac',
    brand: 'Faplac',
    category: 'board',
    substrate: 'Melamina',
    name: 'Melamina básica',
    color: null,
    thicknessMm: 18,
    lengthMm: 2750,
    widthMm: 1830,
    unit: 'placa',
    priceArs: 110_000,
    currency: 'ARS',
    source: 'Carga provisoria Rubik OS',
  },
  {
    supplier: 'Faplac',
    brand: 'Faplac',
    category: 'board',
    substrate: 'Melamina Nature',
    name: 'Nature Blanco',
    color: 'Blanco',
    thicknessMm: 18,
    lengthMm: 2750,
    widthMm: 1830,
    unit: 'placa',
    priceArs: 120_000,
    currency: 'ARS',
    source: 'Carga provisoria Rubik OS',
  },
  {
    supplier: 'Faplac',
    brand: 'Faplac',
    category: 'board',
    substrate: 'Melamina',
    name: 'Melamina diseño/madera',
    color: null,
    thicknessMm: 18,
    lengthMm: 2750,
    widthMm: 1830,
    unit: 'placa',
    priceArs: 135_000,
    currency: 'ARS',
    source: 'Carga provisoria Rubik OS',
  },
  {
    supplier: 'Faplac',
    brand: 'Faplac',
    category: 'board',
    substrate: 'MDF melamínico',
    name: 'MDF melamínico',
    color: null,
    thicknessMm: 18,
    lengthMm: 2750,
    widthMm: 1830,
    unit: 'placa',
    priceArs: 150_000,
    currency: 'ARS',
    source: 'Carga provisoria Rubik OS',
  },
  {
    supplier: 'Faplac',
    brand: 'Faplac',
    category: 'board',
    substrate: 'Línea premium/táctil',
    name: 'Línea premium/táctil',
    color: null,
    thicknessMm: 18,
    lengthMm: null,
    widthMm: null,
    unit: 'placa',
    priceArs: 370_000,
    currency: 'ARS',
    source: 'Carga provisoria Rubik OS',
  },
  {
    supplier: 'Faplac',
    brand: 'Faplac',
    category: 'edge_band',
    substrate: 'Melamínico',
    name: 'Tapacanto melamínico rollo 22mm x 50m',
    color: null,
    thicknessMm: null,
    lengthMm: 50_000,
    widthMm: 22,
    unit: 'rollo',
    priceArs: 35_000,
    currency: 'ARS',
    source: 'Carga provisoria Rubik OS',
  },
  {
    supplier: 'Faplac',
    brand: 'Faplac',
    category: 'edge_band',
    substrate: 'PVC',
    name: 'Tapacanto PVC 2mm por metro',
    color: null,
    thicknessMm: 2,
    lengthMm: 1000,
    widthMm: null,
    unit: 'metro',
    priceArs: 3_500,
    currency: 'ARS',
    source: 'Carga provisoria Rubik OS',
  },
];

export type MaterialLinePricingInput = {
  unitPriceArs: number;
  quantity: number;
};

export function calculateMaterialLineTotalArs(input: MaterialLinePricingInput): number {
  assertNonNegative(input.unitPriceArs, 'unitPriceArs');
  assertPositive(input.quantity, 'quantity');

  return roundCurrency(input.unitPriceArs * input.quantity);
}

function assertNonNegative(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a finite number greater than or equal to 0.`);
  }
}

function assertPositive(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${fieldName} must be a finite number greater than 0.`);
  }
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
