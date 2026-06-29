import { describe, expect, it } from 'vitest';

import type { CutlistItem } from '../src/modules/cutlists/types.js';
import { PROVISIONAL_FAPLAC_MATERIALS } from '../src/modules/materials/materialPricing.js';
import type { Quote } from '../src/modules/quotes/index.js';
import {
  applyQuoteValidityRules,
  calculateQuoteTotals,
  canSendCutlistToSupplier,
} from '../src/modules/quotes/index.js';

const baseQuote: Quote = {
  id: 'quote-example-id',
  clientId: null,
  projectId: null,
  quoteNumber: 'COT-EXAMPLE-001',
  title: 'Ejemplo Rubik OS',
  description: null,
  status: 'validada',
  currency: 'ARS',
  exchangeRateId: null,
  subtotalMaterialsArs: 0,
  subtotalHardwareArs: 0,
  subtotalServicesArs: 0,
  subtotalLaborArs: 0,
  wastePercentage: 12,
  marginPercentage: 35,
  discountArs: 0,
  totalArs: 1,
  totalUsd: null,
  depositPercentage: 50,
  depositArs: 0.5,
  depositUsd: null,
  validUntil: new Date('2026-07-01T12:00:00.000Z'),
  frozenAt: null,
  approvedByDiego: true,
  approvedByDiegoAt: new Date('2026-06-29T12:00:00.000Z'),
  notesInternal: null,
  notesClient: null,
  createdAt: new Date('2026-06-29T12:00:00.000Z'),
  updatedAt: new Date('2026-06-29T12:00:00.000Z'),
};

function createCutlistItem(overrides: Partial<CutlistItem> = {}): CutlistItem {
  return {
    id: 'cutlist-example-id',
    quoteId: baseQuote.id,
    moduleName: 'Bajo mesada',
    pieceName: 'Lateral izquierdo',
    materialId: 'material-faplac-basica-18mm',
    quantity: 1,
    lengthMm: 720,
    widthMm: 560,
    thicknessMm: 18,
    edgeFrontMm: 560,
    edgeBackMm: 0,
    edgeLeftMm: 0,
    edgeRightMm: 0,
    grainDirection: 'vertical',
    notes: null,
    approvedForCut: true,
    createdAt: new Date('2026-06-29T12:00:00.000Z'),
    ...overrides,
  };
}

describe('Rubik OS quote and cutlist real examples', () => {
  it('calculates an ARS quote for a simple 180 cm base cabinet', () => {
    const faplacBasicMelamine = PROVISIONAL_FAPLAC_MATERIALS.find(
      (material) => material.name === 'Melamina básica',
    );

    expect(faplacBasicMelamine?.priceArs).toBe(110_000);

    const totals = calculateQuoteTotals({
      materialsSubtotal: faplacBasicMelamine?.priceArs ?? 0,
      hardwareSubtotal: 25_000,
      servicesSubtotal: 15_000,
      laborSubtotal: 40_000,
      wastePercentage: 12,
      marginPercentage: 35,
      discount: 0,
      depositPercentage: 50,
      currency: 'ARS',
      exchangeRateSell: null,
    });

    expect(totals).toEqual({
      subtotalBeforeWaste: 190_000,
      wasteAmount: 22_800,
      subtotalWithWaste: 212_800,
      marginAmount: 74_480,
      totalArs: 287_280,
      totalUsd: null,
      depositArs: 143_640,
      depositUsd: null,
    });
  });

  it('calculates a USD quote for a TV rack using manual blue-dollar sell rate', () => {
    const totals = calculateQuoteTotals({
      materialsSubtotal: 220_000,
      hardwareSubtotal: 35_000,
      servicesSubtotal: 20_000,
      laborSubtotal: 65_000,
      wastePercentage: 12,
      marginPercentage: 35,
      discount: 0,
      depositPercentage: 50,
      currency: 'USD',
      exchangeRateSell: 1_350,
    });

    expect(totals.totalArs).toBe(514_080);
    expect(totals.totalUsd).toBe(380.8);
    expect(totals.depositArs).toBe(257_040);
    expect(totals.depositUsd).toBe(190.4);
  });

  it('marks an unsigned expired quote as recalculable', () => {
    const rules = applyQuoteValidityRules({
      status: 'enviada_cliente',
      validUntil: '2026-06-27T12:00:00.000Z',
      frozenAt: null,
      approvedByDiego: true,
      now: '2026-06-29T12:00:00.000Z',
    });

    expect(rules).toEqual({
      isExpired: true,
      canRecalculate: true,
      isFrozenByDeposit: false,
      requiresDiegoValidation: false,
    });
  });

  it('keeps a signed quote frozen and not automatically recalculable', () => {
    const rules = applyQuoteValidityRules({
      status: 'señada',
      validUntil: '2026-06-27T12:00:00.000Z',
      frozenAt: '2026-06-28T10:00:00.000Z',
      approvedByDiego: true,
      now: '2026-06-29T12:00:00.000Z',
    });

    expect(rules).toMatchObject({
      isExpired: false,
      canRecalculate: false,
      isFrozenByDeposit: true,
    });
  });

  it('blocks a cutlist with incomplete or unapproved pieces', () => {
    const blockedCutlist = [
      createCutlistItem({
        id: 'missing-material',
        materialId: null,
      }),
      createCutlistItem({
        id: 'not-approved',
        approvedForCut: false,
      }),
    ];

    expect(canSendCutlistToSupplier(baseQuote, blockedCutlist)).toBe(false);
  });

  it('allows a complete cutlist approved by Diego and approved piece by piece', () => {
    const approvedQuote: Quote = {
      ...baseQuote,
      approvedByDiego: true,
      approvedByDiegoAt: new Date('2026-06-29T12:00:00.000Z'),
    };
    const completeCutlist = [
      createCutlistItem({
        id: 'left-side',
        pieceName: 'Lateral izquierdo',
      }),
      createCutlistItem({
        id: 'right-side',
        pieceName: 'Lateral derecho',
      }),
      createCutlistItem({
        id: 'bottom',
        pieceName: 'Piso',
        lengthMm: 1800,
        widthMm: 560,
        grainDirection: 'horizontal',
      }),
    ];

    expect(canSendCutlistToSupplier(approvedQuote, completeCutlist)).toBe(true);
  });
});
