import type {
  Demo3DViewerModel,
  DemoCutlistItem,
  DemoModuleComposition,
  DemoPiece,
  DemoSelectedBaseModule,
  DemoTotals,
  DesignEngineDemoForm,
  DesignEngineDemoResult,
} from './types';

export const DEMO_PRELIMINARY_NOTE =
  'Cotización preliminar sujeta a validación de Diego y actualización de precios de materiales.';
export const WHATSAPP_3070_VALIDATION_WARNING =
  'Composición preliminar tomada de medición/foto WhatsApp. Validar en obra antes de corte.';

const DIEGO_VALIDATION_NOTE =
  'Demo interna beta. Despiece preliminar generado por Rubik OS: requiere validación de Diego antes de enviar a corte.';
const VIEWER_VALIDATION_NOTE =
  'Vista 3D técnica preliminar — no apta para fabricación sin validación de Diego.';
const DOOR_EDGE_MM = 2;
const TOP_RAIL_WIDTH_MM = 100;
const SHELF_DEPTH_REDUCTION_MM = 50;

const DEFAULT_DEMO_BASE_MODULES: DemoSelectedBaseModule[] = [
  {
    code: 'BASE_DOORS_900_DOUBLE',
    name: 'Módulo bajo puertas doble 900',
    type: 'doors',
    widthMm: 900,
    doors: 2,
    drawers: 0,
    shelves: 1,
  },
  {
    code: 'BASE_DRAWERS_900_3_DEMO',
    name: 'Cajonera baja 900 con 3 cajones',
    type: 'drawers',
    widthMm: 900,
    doors: 0,
    drawers: 3,
    shelves: 0,
  },
];

export const WHATSAPP_3070_DEMO_MODULES: DemoSelectedBaseModule[] = [
  {
    code: 'BASE_DOORS_800_DOUBLE',
    name: 'Puertas doble 800 mm',
    type: 'doors',
    widthMm: 800,
    doors: 2,
    drawers: 0,
    shelves: 1,
  },
  {
    code: 'BASE_DRAWERS_560_3_DEMO',
    name: 'Cajonera 560 mm',
    type: 'drawers',
    widthMm: 560,
    doors: 0,
    drawers: 3,
    shelves: 0,
  },
  {
    code: 'BASE_DOORS_1000_DOUBLE_DEMO',
    name: 'Puertas doble 1000 mm',
    type: 'doors',
    widthMm: 1000,
    doors: 2,
    drawers: 0,
    shelves: 1,
  },
  {
    code: 'BASE_FILLER_710_DEMO',
    name: 'Relleno/ajuste 710 mm',
    type: 'filler',
    widthMm: 710,
    doors: 0,
    drawers: 0,
    shelves: 0,
  },
];

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
  selectedBaseModules: cloneModules(DEFAULT_DEMO_BASE_MODULES),
  measurementWarning: null,
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

export function createWhatsApp3070DemoForm(current: DesignEngineDemoForm): DesignEngineDemoForm {
  return {
    ...current,
    widthMm: 3070,
    heightMm: 750,
    depthMm: 650,
    doorModuleWidthMm: 800,
    doorCount: 2,
    shelfCount: 1,
    drawerModuleWidthMm: 560,
    drawerCount: 3,
    selectedBaseModules: cloneModules(WHATSAPP_3070_DEMO_MODULES),
    measurementWarning: WHATSAPP_3070_VALIDATION_WARNING,
  };
}

export function calculateDesignEngineDemo(form: DesignEngineDemoForm): DesignEngineDemoResult {
  const normalizedForm = normalizeToeKick(form);
  const moduleComposition = createModuleComposition(normalizedForm);
  const errors = validateForm(normalizedForm);

  if (errors.length > 0) {
    return createEmptyResult(errors, moduleComposition);
  }

  const warnings = moduleComposition.warnings;
  const viewer3d = createViewer3dModel(normalizedForm, moduleComposition);
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
    moduleComposition,
    viewer3d,
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

function createModuleComposition(form: DesignEngineDemoForm): DemoModuleComposition {
  const selectedWidthMm = roundMeasure(
    form.selectedBaseModules.reduce((total, module) => total + module.widthMm, 0),
  );
  const differenceMm = roundMeasure(selectedWidthMm - form.widthMm);
  const warnings: string[] = [];

  if (form.measurementWarning) {
    warnings.push(form.measurementWarning);
  }

  if (differenceMm > 0) {
    warnings.push(
      `La composición modular supera el ancho disponible por ${formatMeasure(differenceMm)} mm.`,
    );
  }

  if (differenceMm < 0) {
    warnings.push(
      `Falta relleno o ajuste por ${formatMeasure(Math.abs(differenceMm))} mm para cubrir el ancho disponible.`,
    );
  }

  return {
    availableWidthMm: form.widthMm,
    selectedWidthMm,
    differenceMm,
    status:
      differenceMm === 0
        ? 'encaja'
        : differenceMm < 0
          ? 'falta_relleno'
          : 'supera_ancho_disponible',
    warnings,
  };
}

function createViewer3dModel(
  form: DesignEngineDemoForm,
  moduleComposition: DemoModuleComposition,
): Demo3DViewerModel {
  let cursorMm = 0;
  const modules = form.selectedBaseModules.map((module) => {
    const startMm = cursorMm;
    const endMm = roundMeasure(startMm + module.widthMm);
    cursorMm = endMm;

    return {
      ...module,
      startMm,
      endMm,
      label: formatModuleLabel(module),
    };
  });

  return {
    widthMm: form.widthMm,
    heightMm: form.heightMm,
    depthMm: form.depthMm,
    hasBackPanel: form.hasBackPanel,
    hasToeKick: form.hasToeKick,
    toeKickHeightMm: form.hasToeKick ? form.toeKickHeightMm : 0,
    modules,
    moduleComposition,
    warnings: moduleComposition.warnings,
    validationNote: VIEWER_VALIDATION_NOTE,
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
  ];
  const internalDivisions = Math.max(form.selectedBaseModules.length - 1, 0);

  if (internalDivisions > 0) {
    pieces.push(
      createPiece(
        'General',
        'Divisiones internas',
        internalDivisions,
        form.heightMm,
        form.depthMm,
        form.materialThicknessMm,
        'vertical',
      ),
    );
  }

  for (const module of form.selectedBaseModules) {
    pieces.push(...createModulePieces(form, module));
  }

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

  return pieces.filter((piece) => piece.quantity > 0);
}

function createModulePieces(
  form: DesignEngineDemoForm,
  module: DemoSelectedBaseModule,
): DemoPiece[] {
  const pieces: DemoPiece[] = [];

  if ((module.type === 'doors' || module.type === 'sink') && module.shelves > 0) {
    pieces.push(
      createPiece(
        module.name,
        'Estantes',
        module.shelves,
        module.widthMm - 2 * form.materialThicknessMm,
        form.depthMm - SHELF_DEPTH_REDUCTION_MM,
        form.materialThicknessMm,
        'horizontal',
      ),
    );
  }

  if ((module.type === 'doors' || module.type === 'sink') && module.doors > 0) {
    pieces.push(
      createPiece(
        module.name,
        'Puertas',
        module.doors,
        form.heightMm - 4,
        module.widthMm / module.doors - 3,
        form.materialThicknessMm,
        'vertical',
        DOOR_EDGE_MM,
      ),
    );
  }

  if (module.type === 'drawers' && module.drawers > 0) {
    pieces.push(
      createPiece(
        module.name,
        'Frentes de cajón',
        module.drawers,
        (form.heightMm - 6) / module.drawers,
        module.widthMm - 4,
        form.materialThicknessMm,
        'horizontal',
        DOOR_EDGE_MM,
      ),
    );
  }

  if (module.type === 'open_shelves' && module.shelves > 0) {
    pieces.push(
      createPiece(
        module.name,
        'Estantes abiertos',
        module.shelves,
        module.widthMm - 2 * form.materialThicknessMm,
        form.depthMm - SHELF_DEPTH_REDUCTION_MM,
        form.materialThicknessMm,
        'horizontal',
      ),
    );
  }

  if (module.type === 'filler') {
    pieces.push(
      createPiece(
        module.name,
        'Relleno de ajuste',
        1,
        form.heightMm,
        module.widthMm,
        form.materialThicknessMm,
        'vertical',
        DOOR_EDGE_MM,
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

  if (form.selectedBaseModules.length === 0) {
    errors.push('Seleccioná al menos un módulo prediseñado para componer el bajo mesada.');
  }

  for (const module of form.selectedBaseModules) {
    if (!Number.isFinite(module.widthMm) || module.widthMm <= 0) {
      errors.push(`El módulo "${module.name}" debe tener ancho mayor a 0.`);
    }

    if ((module.type === 'doors' || module.type === 'sink') && module.doors <= 0) {
      errors.push(`El módulo "${module.name}" debe indicar cantidad de puertas.`);
    }

    if (module.type === 'drawers' && module.drawers <= 0) {
      errors.push(`El módulo "${module.name}" debe indicar cantidad de cajones.`);
    }
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

function createEmptyResult(
  errors: string[],
  moduleComposition: DemoModuleComposition = {
    availableWidthMm: 0,
    selectedWidthMm: 0,
    differenceMm: 0,
    status: 'encaja',
    warnings: [],
  },
): DesignEngineDemoResult {
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
    warnings: moduleComposition.warnings,
    errors,
    materialSurfaceM2: 0,
    estimatedBoards: 0,
    edgeBandLinearMeters: 0,
    materialCostArs: 0,
    edgeBandCostArs: 0,
    totals,
    moduleComposition,
    viewer3d: null,
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

function cloneModules(modules: DemoSelectedBaseModule[]): DemoSelectedBaseModule[] {
  return modules.map((module) => ({ ...module }));
}

function formatModuleLabel(module: DemoSelectedBaseModule): string {
  if (module.type === 'doors') {
    return `${module.doors} puerta${module.doors === 1 ? '' : 's'}`;
  }

  if (module.type === 'drawers') {
    return `${module.drawers} cajón${module.drawers === 1 ? '' : 'es'}`;
  }

  if (module.type === 'filler') {
    return 'ajuste';
  }

  if (module.type === 'open_shelves') {
    return `${module.shelves} estante${module.shelves === 1 ? '' : 's'}`;
  }

  if (module.type === 'sink') {
    return 'piletero';
  }

  return 'horno';
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

function formatMeasure(value: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value);
}
