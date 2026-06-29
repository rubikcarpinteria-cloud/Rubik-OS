import { describe, expect, it } from 'vitest';

import {
  convertDesignPiecesToCutlistItems,
  generateKitchenBaseCabinetCutlist,
  type KitchenBaseCabinetInput,
} from '../src/modules/design-engine/index.js';
import type { Quote } from '../src/modules/quotes/index.js';
import { canSendCutlistToSupplier } from '../src/modules/quotes/index.js';

const quoteId = 'quote-design-engine-id';
const materialId = 'material-faplac-basica-18mm';

const baseQuote: Quote = {
  id: quoteId,
  clientId: null,
  projectId: null,
  quoteNumber: 'COT-DESIGN-001',
  title: 'Bajo mesada generado por motor de diseño',
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

const kitchenBaseCabinetInput: KitchenBaseCabinetInput = {
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

function createDesignResult() {
  return generateKitchenBaseCabinetCutlist(kitchenBaseCabinetInput);
}

describe('design engine to cutlist adapter', () => {
  it('converts kitchen base cabinet design pieces to cutlist items', () => {
    const designResult = createDesignResult();
    const cutlist = convertDesignPiecesToCutlistItems({
      quoteId,
      materialId,
      designResult,
      idPrefix: 'cutlist-test',
    });

    expect(cutlist).toHaveLength(designResult.pieces.length);
    expect(cutlist[0]).toMatchObject({
      id: 'cutlist-test-1',
      quoteId,
      moduleName: null,
      pieceName: 'Laterales',
      materialId,
      quantity: 2,
      lengthMm: 720,
      widthMm: 620,
      thicknessMm: 18,
      approvedForCut: false,
    });
  });

  it('keeps approvedForCut false by default and allows nullable quote/material ids', () => {
    const cutlist = convertDesignPiecesToCutlistItems({
      designResult: createDesignResult(),
    });

    expect(cutlist.every((item) => item.approvedForCut === false)).toBe(true);
    expect(cutlist.every((item) => item.quoteId === null)).toBe(true);
    expect(cutlist.every((item) => item.materialId === null)).toBe(true);
  });

  it('assigns materialId when provided', () => {
    const cutlist = convertDesignPiecesToCutlistItems({
      quoteId,
      materialId,
      designResult: createDesignResult(),
    });

    expect(cutlist.every((item) => item.materialId === materialId)).toBe(true);
  });

  it('preserves Diego validation notes from the design result', () => {
    const cutlist = convertDesignPiecesToCutlistItems({
      quoteId,
      materialId,
      designResult: createDesignResult(),
    });

    expect(cutlist.every((item) => item.notes?.includes('validación de Diego'))).toBe(true);
  });

  it('cannot be sent to supplier without Diego approval or with unapproved pieces', () => {
    const approvedByPieceIsFalse = convertDesignPiecesToCutlistItems({
      quoteId,
      materialId,
      designResult: createDesignResult(),
    });
    const approvedByPieceIsTrue = convertDesignPiecesToCutlistItems({
      quoteId,
      materialId,
      designResult: createDesignResult(),
      approvedForCut: true,
    });
    const quoteWithoutDiegoApproval: Quote = {
      ...baseQuote,
      approvedByDiego: false,
      approvedByDiegoAt: null,
    };

    expect(canSendCutlistToSupplier(baseQuote, approvedByPieceIsFalse)).toBe(false);
    expect(canSendCutlistToSupplier(quoteWithoutDiegoApproval, approvedByPieceIsTrue)).toBe(false);
  });

  it('can be sent to supplier only when Diego approved, all pieces have material and all pieces are approved', () => {
    const approvedCutlist = convertDesignPiecesToCutlistItems({
      quoteId,
      materialId,
      designResult: createDesignResult(),
      approvedForCut: true,
    });

    expect(canSendCutlistToSupplier(baseQuote, approvedCutlist)).toBe(true);
  });
});
