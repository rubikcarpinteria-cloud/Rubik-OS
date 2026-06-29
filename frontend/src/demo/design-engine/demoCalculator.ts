import type {
  DemoCutlistItem,
  DemoPiece,
  DemoTotals,
  DesignEngineDemoForm,
  DesignEngineDemoResult,
} from './types';

export const DEMO_PRELIMINARY_NOTE =
  'Cotización preliminar sujeta a validación de Diego y actualización de precios de materiales.';

const DIEGO_VALIDATION_NOTE =
  'Demo interna beta. Despiece preliminar generado por Rubik OS: requiere validación de Diego antes de enviar a corte.';
const DOOR_EDGE_MM = 2;
const TOP_RAIL_WIDTH_MM = 100;
const SHELF_DEPTH_REDUCTION_MM = 50;

export const DEFAULT_DESIGN_ENGINE_DEMO_FORM: DesignEngineDemoForm = {
  widthMm: 1800,
  heightMm: 720,
  depthMm: 620,
  materialThicknessMm: 18,
  backPanelThicknessMm: 3,
  hasBackPanel: true,
  hasToeKick: true,
  toeKickHeightMm: 100,
  doorModuleWidthMm: 900,
  doorCount: 2,
  shelfCount: 1,
  drawerModuleWidthMm: 900,
  drawerCount: 3,
  boardPriceArs: 110_000,
  boardWidthMm: 1830,
  boardLengthMm: 2750,
  edgeBandPriceArsPerMeter: 3500,
  hardwareSubtotalArs: 25_000,
  servicesSubtotalArs: 15_000,
  laborSubtotalArs: 40_000,
  wastePercentage: 12,
  marginPercentage: 35,
  depositPercentage: 50,
  currency: 'ARS',
  exchangeRateSell: 1350,
};

export function calculateDesignEngineDemo(form: DesignEngineDemoForm): DesignEngineDemoResult {
  const normalizedForm = normalizeToeKick(form);
  const errors = validateForm(normalizedForm);

  if (errors.length > 0) {
    return createEmptyResult(errors);
  }

  const warnings = createWarnings(normalizedForm);
  const pieces = createPieces(normalizedForm);
  const cutlistItems = pieces.map((piece): DemoCutlistItem => {
    return {
      ...piece,
      quoteId: null,
      materialId: 'demo-material-faplac-basica-18mm',
      approvedForCut: false,
    };
  });
  const materialSurfaceM2 = roundMeasure(
    pieces
      .filter((piece) => piece.thicknessMm === normalizedForm.materialThicknessMm)
      .reduce(
        (total, piece) => total + piece.quantity * mm2ToM2(piece.lengthMm * piece.widthMm),
        0,
      ),
  );
  const boardAreaM2 = mm2ToM2(normalizedForm.boardWidthMm * normalizedForm.boardLengthMm);
  const estimatedBoards = roundMeasure(materialSurfaceM2 / boardAreaM2);
  const materialCostArs = roundCurrency(estimatedBoards * normalizedForm.boardPriceArs);
  const edgeBandLinearMeters = roundMeasure(
    pieces.reduce((total, piece) => {
      const front = piece.edgeFrontMm > 0 ? piece.lengthMm : 0;
      const back = piece.edgeBackMm > 0 ? piece.lengthMm : 0;
      const left = piece.edgeLeftMm > 0 ? piece.widthMm : 0;
      const right = piece.edgeRightMm > 0 ? piece.widthMm : 0;

      return total + piece.quantity * mmToM(front + back + left + right);
    }, 0),
  );
  const edgeBandCostArs = roundCurrency(
    edgeBandLinearMeters * normalizedForm.edgeBandPriceArsPerMeter,
  );
  const totals = calculateTotals({
    materialsSubtotal: materialCostArs + edgeBandCostArs,
    hardwareSubtotal: normalizedForm.hardwareSubtotalArs,
    servicesSubtotal: normalizedForm.servicesSubtotalArs,
    laborSubtotal: normalizedForm.laborSubtotalArs,
    wastePercentage: normalizedForm.wastePercentage,
    marginPercentage: normalizedForm.marginPercentage,
    depositPercentage: normalizedForm.depositPercentage,
    currency: normalizedForm.currency,
    exchangeRateSell: normalizedForm.exchangeRateSell,
  });

  return {
    pieces,
    cutlistItems,
    warnings,
    errors: [],
    materialSurfaceM2,
    estimatedBoards,
    edgeBandLinearMeters,
    materialCostArs,
    edgeBandCostArs,
    totals,
    notes: [DIEGO_VALIDATION_NOTE, DEMO_PRELIMINARY_NOTE],
  };
}

function normalizeToeKick(form: DesignEngineDemoForm): DesignEngineDemoForm {
  if (form.hasToeKick) {
    return form;
  }

  return {
    ...form,
    toeKickHeightMm: 0,
  };
}

function createPieces(form: DesignEngineDemoForm): DemoPiece[] {
  const pieces: DemoPiece[] = [
    createPiece(
      'General',
      'Laterales',
      2,
      form.heightMm,
      form.depthMm,
      form.materialThicknessMm,
      'vertical',
    ),
    createPiece(
      'General',
      'Base',
      1,
      form.widthMm - 2 * form.materialThicknessMm,
      form.depthMm,
      form.materialThicknessMm,
      'horizontal',
    ),
    createPiece(
      'General',
      'Travesaños superiores',
      2,
      form.widthMm - 2 * form.materialThicknessMm,
      TOP_RAIL_WIDTH_MM,
      form.materialThicknessMm,
      'horizontal',
    ),
    createPiece(
      'General',
      'División interna',
      1,
      form.heightMm,
      form.depthMm,
      form.materialThicknessMm,
      'vertical',
    ),
    createPiece(
      'puertas izquierdas',
      'Estantes',
      form.shelfCount,
      form.doorModuleWidthMm - 2 * form.materialThicknessMm,
      form.depthMm - SHELF_DEPTH_REDUCTION_MM,
      form.materialThicknessMm,
      'horizontal',
    ),
    createPiece(
      'puertas izquierdas',
      'Puertas',
      form.doorCount,
      form.heightMm - 4,
      form.doorModuleWidthMm / form.doorCount - 3,
      form.materialThicknessMm,
      'vertical',
      DOOR_EDGE_MM,
    ),
    createPiece(
      'cajonera derecha',
      'Frentes de cajón',
      form.drawerCount,
      (form.heightMm - 6) / form.drawerCount,
      form.drawerModuleWidthMm - 4,
      form.materialThicknessMm,
      'horizontal',
      DOOR_EDGE_MM,
    ),
  ];

  if (form.hasBackPanel) {
    pieces.push(
      createPiece(
        'General',
        'Fondo',
        1,
        form.widthMm,
        form.heightMm,
        form.backPanelThicknessMm,
        'indistinto',
      ),
    );
  }

  if (form.hasToeKick) {
    pieces.push(
      createPiece(
        'General',
        'Frente de zócalo',
        1,
        form.widthMm,
        form.toeKickHeightMm,
        form.materialThicknessMm,
        'horizontal',
      ),
    );
  }

  return pieces;
}

function createPiece(
  moduleName: string,
  pieceName: string,
  quantity: number,
  lengthMm: number,
  widthMm: number,
  thicknessMm: number,
  grainDirection: DemoPiece['grainDirection'],
  edgeMm = 0,
): DemoPiece {
  return {
    moduleName,
    pieceName,
    quantity,
    lengthMm: roundMeasure(lengthMm),
    widthMm: roundMeasure(widthMm),
    thicknessMm,
    edgeFrontMm: edgeMm,
    edgeBackMm: edgeMm,
    edgeLeftMm: edgeMm,
    edgeRightMm: edgeMm,
    grainDirection,
    notes: DIEGO_VALIDATION_NOTE,
  };
}

function createWarnings(form: DesignEngineDemoForm): string[] {
  const modulesWidth = form.doorModuleWidthMm + form.drawerModuleWidthMm;

  if (modulesWidth === form.widthMm) {
    return [];
  }

  return [
    `La suma de módulos (${modulesWidth} mm) no coincide con el ancho total (${form.widthMm} mm).`,
  ];
}

function validateForm(form: DesignEngineDemoForm): string[] {
  const requiredPositiveFields: Array<[keyof DesignEngineDemoForm, string]> = [
    ['widthMm', 'Ancho del mueble'],
    ['heightMm', 'Alto del mueble'],
    ['depthMm', 'Profundidad del mueble'],
    ['materialThicknessMm', 'Espesor de melamina'],
    ['backPanelThicknessMm', 'Espesor de fondo'],
    ['doorModuleWidthMm', 'Ancho módulo puertas'],
    ['doorCount', 'Cantidad de puertas'],
    ['drawerModuleWidthMm', 'Ancho módulo cajonera'],
    ['drawerCount', 'Cantidad de cajones'],
    ['boardPriceArs', 'Precio de placa'],
    ['boardWidthMm', 'Ancho de placa'],
    ['boardLengthMm', 'Largo de placa'],
    ['edgeBandPriceArsPerMeter', 'Precio de canto por metro'],
    ['depositPercentage', 'Porcentaje de seña'],
  ];
  const errors = requiredPositiveFields
    .filter(([field]) => {
      const value = form[field];
      return typeof value !== 'number' || !Number.isFinite(value) || value <= 0;
    })
    .map(([, label]) => `${label} debe ser mayor a 0.`);

  if (form.hasToeKick && (!Number.isFinite(form.toeKickHeightMm) || form.toeKickHeightMm <= 0)) {
    errors.push('Si incluís zócalo, indicá la altura del zócalo.');
  }

  if (form.currency === 'USD' && form.exchangeRateSell <= 0) {
    errors.push('Para cotizar en USD, el dólar blue venta manual debe ser mayor a 0.');
  }

  if (form.wastePercentage < 0 || form.marginPercentage < 0) {
    errors.push('Merma y margen no pueden ser negativos.');
  }

  if (form.depositPercentage > 100) {
    errors.push('La seña no puede superar el 100%.');
  }

  return errors;
}

function createEmptyResult(errors: string[]): DesignEngineDemoResult {
  const totals: DemoTotals = {
    subtotalBeforeWaste: 0,
    wasteAmount: 0,
    subtotalWithWaste: 0,
    marginAmount: 0,
    totalArs: 0,
    totalUsd: null,
    depositArs: 0,
    depositUsd: null,
  };

  return {
    pieces: [],
    cutlistItems: [],
    warnings: [],
    errors,
    materialSurfaceM2: 0,
    estimatedBoards: 0,
    edgeBandLinearMeters: 0,
    materialCostArs: 0,
    edgeBandCostArs: 0,
    totals,
    notes: [DEMO_PRELIMINARY_NOTE],
  };
}

function calculateTotals(input: {
  materialsSubtotal: number;
  hardwareSubtotal: number;
  servicesSubtotal: number;
  laborSubtotal: number;
  wastePercentage: number;
  marginPercentage: number;
  depositPercentage: number;
  currency: 'ARS' | 'USD';
  exchangeRateSell: number;
}): DemoTotals {
  const subtotalBeforeWaste = roundCurrency(
    input.materialsSubtotal + input.hardwareSubtotal + input.servicesSubtotal + input.laborSubtotal,
  );
  const wasteAmount = roundCurrency(subtotalBeforeWaste * (input.wastePercentage / 100));
  const subtotalWithWaste = roundCurrency(subtotalBeforeWaste + wasteAmount);
  const marginAmount = roundCurrency(subtotalWithWaste * (input.marginPercentage / 100));
  const totalArs = roundCurrency(subtotalWithWaste + marginAmount);
  const totalUsd =
    input.currency === 'USD' ? roundCurrency(totalArs / input.exchangeRateSell) : null;
  const depositArs = roundCurrency(totalArs * (input.depositPercentage / 100));
  const depositUsd =
    totalUsd === null ? null : roundCurrency(totalUsd * (input.depositPercentage / 100));

  return {
    subtotalBeforeWaste,
    wasteAmount,
    subtotalWithWaste,
    marginAmount,
    totalArs,
    totalUsd,
    depositArs,
    depositUsd,
  };
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
