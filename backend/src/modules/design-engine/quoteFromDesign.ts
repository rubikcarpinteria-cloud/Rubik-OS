import type { QuoteCurrency } from '../quotes/index.js';
import { calculateQuoteTotals, type QuoteTotals } from '../quotes/index.js';
import { generateKitchenBaseCabinetCutlist } from './kitchenBaseCabinet.js';
import { convertDesignPiecesToCutlistItems, type CutlistItemDraft } from './toCutlist.js';
import type {
  DesignEngineWarning,
  KitchenBaseCabinetDesignResult,
  KitchenBaseCabinetInput,
  PreliminaryCutlistPiece,
} from './types.js';

export type MainMaterialPricingInput = {
  materialId?: string | null;
  priceArsPerSheet?: number;
  sheetLengthMm?: number;
  sheetWidthMm?: number;
  priceArsPerSquareMeter?: number;
};

export type MaterialUsage = {
  surfaceM2: number;
  pricingMode: 'sheet' | 'square_meter';
  sheetAreaM2: number | null;
  estimatedSheets: number | null;
  unitPriceArs: number;
  totalArs: number;
};

export type EdgeBandUsage = {
  linearMeters: number;
  priceArsPerMeter: number;
  totalArs: number;
};

export type CreatePreliminaryQuoteFromKitchenBaseDesignInput = {
  designInput: KitchenBaseCabinetInput;
  quoteId?: string | null;
  mainMaterial: MainMaterialPricingInput;
  edgeBandPriceArsPerMeter: number;
  hardwareSubtotal?: number;
  servicesSubtotal?: number;
  laborSubtotal?: number;
  discount?: number;
  wastePercentage: number;
  marginPercentage: number;
  depositPercentage: number;
  currency: QuoteCurrency;
  exchangeRateSell?: number | null;
};

export type PreliminaryQuoteFromKitchenBaseDesignResult = {
  designResult: KitchenBaseCabinetDesignResult;
  cutlistItems: CutlistItemDraft[];
  materialUsage: MaterialUsage;
  edgeBandUsage: EdgeBandUsage;
  quoteTotals: QuoteTotals;
  warnings: DesignEngineWarning[];
  notes: string[];
};

export const PRELIMINARY_QUOTE_VALIDATION_NOTE =
  'Cotización preliminar sujeta a validación de Diego y actualización de precios de materiales.';

export function createPreliminaryQuoteFromKitchenBaseDesign(
  input: CreatePreliminaryQuoteFromKitchenBaseDesignInput,
): PreliminaryQuoteFromKitchenBaseDesignResult {
  assertNonNegative(input.hardwareSubtotal ?? 0, 'hardwareSubtotal');
  assertNonNegative(input.servicesSubtotal ?? 0, 'servicesSubtotal');
  assertNonNegative(input.laborSubtotal ?? 0, 'laborSubtotal');
  assertNonNegative(input.discount ?? 0, 'discount');
  assertNonNegative(input.wastePercentage, 'wastePercentage');
  assertNonNegative(input.marginPercentage, 'marginPercentage');
  assertPercentage(input.depositPercentage, 'depositPercentage');
  assertNonNegative(input.edgeBandPriceArsPerMeter, 'edgeBandPriceArsPerMeter');

  const designResult = generateKitchenBaseCabinetCutlist(input.designInput);
  const cutlistItems = convertDesignPiecesToCutlistItems({
    quoteId: input.quoteId ?? null,
    materialId: input.mainMaterial.materialId ?? null,
    designResult,
    approvedForCut: false,
  }).map((item) => {
    return {
      ...item,
      notes: appendNote(item.notes, PRELIMINARY_QUOTE_VALIDATION_NOTE),
    };
  });
  const materialUsage = calculateMainMaterialUsage(designResult.pieces, input);
  const edgeBandUsage = calculateEdgeBandUsage(designResult.pieces, input.edgeBandPriceArsPerMeter);
  const quoteTotals = calculateQuoteTotals({
    materialsSubtotal: roundCurrency(materialUsage.totalArs + edgeBandUsage.totalArs),
    hardwareSubtotal: input.hardwareSubtotal ?? 0,
    servicesSubtotal: input.servicesSubtotal ?? 0,
    laborSubtotal: input.laborSubtotal ?? 0,
    wastePercentage: input.wastePercentage,
    marginPercentage: input.marginPercentage,
    discount: input.discount ?? 0,
    depositPercentage: input.depositPercentage,
    currency: input.currency,
    exchangeRateSell: input.exchangeRateSell ?? null,
  });

  return {
    designResult,
    cutlistItems,
    materialUsage,
    edgeBandUsage,
    quoteTotals,
    warnings: designResult.warnings,
    notes: [...designResult.notes, PRELIMINARY_QUOTE_VALIDATION_NOTE],
  };
}

function calculateMainMaterialUsage(
  pieces: readonly PreliminaryCutlistPiece[],
  input: CreatePreliminaryQuoteFromKitchenBaseDesignInput,
): MaterialUsage {
  const surfaceM2 = roundMeasure(
    pieces
      .filter((piece) => piece.thickness_mm === input.designInput.materialThicknessMm)
      .reduce(
        (total, piece) => total + piece.quantity * mm2ToM2(piece.length_mm * piece.width_mm),
        0,
      ),
  );

  if (input.mainMaterial.priceArsPerSquareMeter !== undefined) {
    assertNonNegative(input.mainMaterial.priceArsPerSquareMeter, 'priceArsPerSquareMeter');

    return {
      surfaceM2,
      pricingMode: 'square_meter',
      sheetAreaM2: null,
      estimatedSheets: null,
      unitPriceArs: input.mainMaterial.priceArsPerSquareMeter,
      totalArs: roundCurrency(surfaceM2 * input.mainMaterial.priceArsPerSquareMeter),
    };
  }

  assertNonNegative(input.mainMaterial.priceArsPerSheet, 'priceArsPerSheet');
  assertPositive(input.mainMaterial.sheetLengthMm, 'sheetLengthMm');
  assertPositive(input.mainMaterial.sheetWidthMm, 'sheetWidthMm');

  const sheetAreaM2 = roundMeasure(
    mm2ToM2(input.mainMaterial.sheetLengthMm * input.mainMaterial.sheetWidthMm),
  );
  const estimatedSheets = roundMeasure(surfaceM2 / sheetAreaM2);

  return {
    surfaceM2,
    pricingMode: 'sheet',
    sheetAreaM2,
    estimatedSheets,
    unitPriceArs: input.mainMaterial.priceArsPerSheet,
    totalArs: roundCurrency(estimatedSheets * input.mainMaterial.priceArsPerSheet),
  };
}

function calculateEdgeBandUsage(
  pieces: readonly PreliminaryCutlistPiece[],
  priceArsPerMeter: number,
): EdgeBandUsage {
  const linearMeters = roundMeasure(
    pieces.reduce((total, piece) => {
      const front = piece.edge_front_mm > 0 ? piece.length_mm : 0;
      const back = piece.edge_back_mm > 0 ? piece.length_mm : 0;
      const left = piece.edge_left_mm > 0 ? piece.width_mm : 0;
      const right = piece.edge_right_mm > 0 ? piece.width_mm : 0;

      return total + piece.quantity * mmToM(front + back + left + right);
    }, 0),
  );

  return {
    linearMeters,
    priceArsPerMeter,
    totalArs: roundCurrency(linearMeters * priceArsPerMeter),
  };
}

function appendNote(currentNote: string | null, note: string): string {
  if (currentNote === null || currentNote.trim().length === 0) {
    return note;
  }

  return `${currentNote} ${note}`;
}

function assertNonNegative(value: number | undefined, fieldName: string): asserts value is number {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a finite number greater than or equal to 0.`);
  }
}

function assertPositive(value: number | undefined, fieldName: string): asserts value is number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${fieldName} must be a finite number greater than 0.`);
  }
}

function assertPercentage(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${fieldName} must be a finite percentage between 0 and 100.`);
  }
}

function mm2ToM2(value: number): number {
  return value / 1_000_000;
}

function mmToM(value: number): number {
  return value / 1000;
}

function roundMeasure(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
