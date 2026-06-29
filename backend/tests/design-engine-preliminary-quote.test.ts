import { describe, expect, it } from 'vitest';

import {
  createPreliminaryQuoteFromKitchenBaseDesign,
  PRELIMINARY_QUOTE_VALIDATION_NOTE,
  type CreatePreliminaryQuoteFromKitchenBaseDesignInput,
  type KitchenBaseCabinetInput,
} from '../src/modules/design-engine/index.js';

const materialId = 'material-faplac-basica-18mm';

const standardDesignInput: KitchenBaseCabinetInput = {
  widthMm: 1800,
  heightMm: 720,
  depthMm: 620,
  materialThicknessMm: 18,
  backPanelThicknessMm: 3,
  hasBackPanel: true,
  hasToeKick: true,
  toeKickHeightMm: 100,
  modules: [
    {
      name: 'puertas izquierdas',
      widthMm: 900,
      type: 'doors',
      doors: 2,
      shelves: 1,
    },
    {
      name: 'cajonera derecha',
      widthMm: 900,
      type: 'drawers',
      drawers: 3,
    },
  ],
};

const baseInput: CreatePreliminaryQuoteFromKitchenBaseDesignInput = {
  designInput: standardDesignInput,
  quoteId: 'quote-preliminary-id',
  mainMaterial: {
    materialId,
    priceArsPerSheet: 110_000,
    sheetLengthMm: 2750,
    sheetWidthMm: 1830,
  },
  edgeBandPriceArsPerMeter: 3500,
  hardwareSubtotal: 25_000,
  servicesSubtotal: 15_000,
  laborSubtotal: 40_000,
  wastePercentage: 12,
  marginPercentage: 35,
  depositPercentage: 50,
  currency: 'ARS',
  exchangeRateSell: null,
};

describe('design engine preliminary quote integration', () => {
  it('creates preliminary ARS quote data from a 1800 mm base cabinet design', () => {
    const result = createPreliminaryQuoteFromKitchenBaseDesign(baseInput);

    expect(result.designResult.pieces.length).toBeGreaterThan(0);
    expect(result.cutlistItems).toHaveLength(result.designResult.pieces.length);
    expect(result.quoteTotals.totalArs).toBeGreaterThan(0);
    expect(result.quoteTotals.totalUsd).toBeNull();
    expect(result.warnings).toEqual([]);
  });

  it('calculates board surface greater than 0', () => {
    const result = createPreliminaryQuoteFromKitchenBaseDesign(baseInput);

    expect(result.materialUsage.surfaceM2).toBeGreaterThan(0);
    expect(result.materialUsage.estimatedSheets).toBeGreaterThan(0);
    expect(result.materialUsage.totalArs).toBeGreaterThan(0);
  });

  it('calculates edge band meters greater than 0 when there are doors and drawer fronts', () => {
    const result = createPreliminaryQuoteFromKitchenBaseDesign(baseInput);

    expect(result.edgeBandUsage.linearMeters).toBeGreaterThan(0);
    expect(result.edgeBandUsage.totalArs).toBeGreaterThan(0);
  });

  it('keeps all generated cutlist items unapproved for cut', () => {
    const result = createPreliminaryQuoteFromKitchenBaseDesign(baseInput);

    expect(result.cutlistItems.every((item) => item.approvedForCut === false)).toBe(true);
  });

  it('preserves Diego validation and preliminary quote notes', () => {
    const result = createPreliminaryQuoteFromKitchenBaseDesign(baseInput);

    expect(result.notes).toContain(PRELIMINARY_QUOTE_VALIDATION_NOTE);
    expect(result.cutlistItems.every((item) => item.notes?.includes('validación de Diego'))).toBe(
      true,
    );
    expect(
      result.cutlistItems.every((item) => item.notes?.includes('Cotización preliminar sujeta')),
    ).toBe(true);
  });

  it('calculates totalUsd when currency is USD and exchangeRateSell is provided', () => {
    const result = createPreliminaryQuoteFromKitchenBaseDesign({
      ...baseInput,
      currency: 'USD',
      exchangeRateSell: 1350,
    });

    expect(result.quoteTotals.totalUsd).not.toBeNull();
    expect(result.quoteTotals.totalUsd).toBeCloseTo(result.quoteTotals.totalArs / 1350, 2);
    expect(result.quoteTotals.depositUsd).toBeCloseTo((result.quoteTotals.totalUsd ?? 0) / 2, 2);
  });

  it('keeps design warnings when module widths do not match the total width', () => {
    const result = createPreliminaryQuoteFromKitchenBaseDesign({
      ...baseInput,
      designInput: {
        ...standardDesignInput,
        modules: [
          {
            name: 'puertas izquierdas',
            widthMm: 800,
            type: 'doors',
            doors: 2,
            shelves: 1,
          },
          {
            name: 'cajonera derecha',
            widthMm: 900,
            type: 'drawers',
            drawers: 3,
          },
        ],
      },
    });

    expect(result.warnings).toEqual([
      {
        code: 'MODULE_WIDTH_MISMATCH',
        message: 'La suma de módulos (1700 mm) no coincide con el ancho total (1800 mm).',
      },
    ]);
    expect(result.cutlistItems.some((item) => item.notes?.includes('La suma de módulos'))).toBe(
      true,
    );
  });
});
