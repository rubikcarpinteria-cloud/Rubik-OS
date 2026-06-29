import type {
  DesignEngineWarning,
  KitchenBaseCabinetDesignResult,
  KitchenBaseCabinetInput,
  KitchenBaseCabinetModuleInput,
  PreliminaryCutlistPiece,
} from './types.js';

const DOOR_EDGE_MM = 2;
const TOP_RAIL_WIDTH_MM = 100;
const SHELF_DEPTH_REDUCTION_MM = 50;
const HUMAN_VALIDATION_NOTE =
  'Despiece preliminar generado por Rubik OS. Requiere validación de Diego antes de enviar a corte.';

export function generateKitchenBaseCabinetCutlist(
  input: KitchenBaseCabinetInput,
): KitchenBaseCabinetDesignResult {
  validateKitchenBaseCabinetInput(input);

  const warnings = buildWarnings(input);
  const pieces: PreliminaryCutlistPiece[] = [
    createPiece({
      moduleName: null,
      pieceName: 'Laterales',
      quantity: 2,
      lengthMm: input.heightMm,
      widthMm: input.depthMm,
      thicknessMm: input.materialThicknessMm,
      grainDirection: 'vertical',
      notes: HUMAN_VALIDATION_NOTE,
    }),
    createPiece({
      moduleName: null,
      pieceName: 'Base',
      quantity: 1,
      lengthMm: input.widthMm - 2 * input.materialThicknessMm,
      widthMm: input.depthMm,
      thicknessMm: input.materialThicknessMm,
      grainDirection: 'horizontal',
      notes: HUMAN_VALIDATION_NOTE,
    }),
    createPiece({
      moduleName: null,
      pieceName: 'Travesaños superiores',
      quantity: 2,
      lengthMm: input.widthMm - 2 * input.materialThicknessMm,
      widthMm: TOP_RAIL_WIDTH_MM,
      thicknessMm: input.materialThicknessMm,
      grainDirection: 'horizontal',
      notes: HUMAN_VALIDATION_NOTE,
    }),
  ];

  pieces.push(...createInternalDivisions(input));

  for (const module of input.modules) {
    pieces.push(...createModulePieces(input, module));
  }

  if (input.hasBackPanel) {
    pieces.push(
      createPiece({
        moduleName: null,
        pieceName: 'Fondo',
        quantity: 1,
        lengthMm: input.widthMm,
        widthMm: input.heightMm,
        thicknessMm: input.backPanelThicknessMm,
        grainDirection: 'indistinto',
        notes: HUMAN_VALIDATION_NOTE,
      }),
    );
  }

  if (input.hasToeKick) {
    pieces.push(
      createPiece({
        moduleName: null,
        pieceName: 'Frente de zócalo',
        quantity: 1,
        lengthMm: input.widthMm,
        widthMm: input.toeKickHeightMm,
        thicknessMm: input.materialThicknessMm,
        grainDirection: 'horizontal',
        notes: HUMAN_VALIDATION_NOTE,
      }),
    );
  }

  return {
    pieces,
    warnings,
    notes: [HUMAN_VALIDATION_NOTE],
  };
}

function createInternalDivisions(input: KitchenBaseCabinetInput): PreliminaryCutlistPiece[] {
  const divisions = Math.max(0, input.modules.length - 1);

  if (divisions === 0) {
    return [];
  }

  return [
    createPiece({
      moduleName: null,
      pieceName: 'Divisiones internas',
      quantity: divisions,
      lengthMm: input.heightMm,
      widthMm: input.depthMm,
      thicknessMm: input.materialThicknessMm,
      grainDirection: 'vertical',
      notes: HUMAN_VALIDATION_NOTE,
    }),
  ];
}

function createModulePieces(
  input: KitchenBaseCabinetInput,
  module: KitchenBaseCabinetModuleInput,
): PreliminaryCutlistPiece[] {
  if (module.type === 'doors') {
    return createDoorModulePieces(input, module);
  }

  return createDrawerModulePieces(input, module);
}

function createDoorModulePieces(
  input: KitchenBaseCabinetInput,
  module: KitchenBaseCabinetModuleInput,
): PreliminaryCutlistPiece[] {
  const doors = module.doors ?? 0;
  const shelves = module.shelves ?? 0;
  const pieces: PreliminaryCutlistPiece[] = [];

  if (shelves > 0) {
    pieces.push(
      createPiece({
        moduleName: module.name,
        pieceName: 'Estantes',
        quantity: shelves,
        lengthMm: module.widthMm - 2 * input.materialThicknessMm,
        widthMm: input.depthMm - SHELF_DEPTH_REDUCTION_MM,
        thicknessMm: input.materialThicknessMm,
        grainDirection: 'horizontal',
        notes: HUMAN_VALIDATION_NOTE,
      }),
    );
  }

  pieces.push(
    createPiece({
      moduleName: module.name,
      pieceName: 'Puertas',
      quantity: doors,
      lengthMm: input.heightMm - 4,
      widthMm: module.widthMm / doors - 3,
      thicknessMm: input.materialThicknessMm,
      edgeFrontMm: DOOR_EDGE_MM,
      edgeBackMm: DOOR_EDGE_MM,
      edgeLeftMm: DOOR_EDGE_MM,
      edgeRightMm: DOOR_EDGE_MM,
      grainDirection: 'vertical',
      notes: HUMAN_VALIDATION_NOTE,
    }),
  );

  return pieces;
}

function createDrawerModulePieces(
  input: KitchenBaseCabinetInput,
  module: KitchenBaseCabinetModuleInput,
): PreliminaryCutlistPiece[] {
  const drawers = module.drawers ?? 0;

  return [
    createPiece({
      moduleName: module.name,
      pieceName: 'Frentes de cajón',
      quantity: drawers,
      lengthMm: (input.heightMm - 6) / drawers,
      widthMm: module.widthMm - 4,
      thicknessMm: input.materialThicknessMm,
      edgeFrontMm: DOOR_EDGE_MM,
      edgeBackMm: DOOR_EDGE_MM,
      edgeLeftMm: DOOR_EDGE_MM,
      edgeRightMm: DOOR_EDGE_MM,
      grainDirection: 'horizontal',
      notes: HUMAN_VALIDATION_NOTE,
    }),
  ];
}

function buildWarnings(input: KitchenBaseCabinetInput): DesignEngineWarning[] {
  const modulesWidth = input.modules.reduce((total, module) => total + module.widthMm, 0);

  if (modulesWidth === input.widthMm) {
    return [];
  }

  return [
    {
      code: 'MODULE_WIDTH_MISMATCH',
      message: `La suma de módulos (${modulesWidth} mm) no coincide con el ancho total (${input.widthMm} mm).`,
    },
  ];
}

function validateKitchenBaseCabinetInput(input: KitchenBaseCabinetInput): void {
  assertPositive(input.widthMm, 'widthMm');
  assertPositive(input.heightMm, 'heightMm');
  assertPositive(input.depthMm, 'depthMm');
  assertPositive(input.materialThicknessMm, 'materialThicknessMm');
  assertPositive(input.backPanelThicknessMm, 'backPanelThicknessMm');

  if (input.hasToeKick) {
    assertPositive(input.toeKickHeightMm, 'toeKickHeightMm');
  }

  if (input.modules.length === 0) {
    throw new RangeError('modules must contain at least one module.');
  }

  for (const module of input.modules) {
    validateModule(module);
  }
}

function validateModule(module: KitchenBaseCabinetModuleInput): void {
  if (module.name.trim().length === 0) {
    throw new RangeError('module.name must not be empty.');
  }

  assertPositive(module.widthMm, `module ${module.name} widthMm`);

  if (module.type === 'doors') {
    assertPositiveInteger(module.doors, `module ${module.name} doors`);
    assertNonNegativeInteger(module.shelves ?? 0, `module ${module.name} shelves`);
    return;
  }

  assertPositiveInteger(module.drawers, `module ${module.name} drawers`);
}

function createPiece(input: {
  moduleName: string | null;
  pieceName: string;
  quantity: number;
  lengthMm: number;
  widthMm: number;
  thicknessMm: number | null;
  edgeFrontMm?: number;
  edgeBackMm?: number;
  edgeLeftMm?: number;
  edgeRightMm?: number;
  grainDirection: PreliminaryCutlistPiece['grain_direction'];
  notes: string | null;
}): PreliminaryCutlistPiece {
  assertPositive(input.quantity, `${input.pieceName} quantity`);
  assertPositive(input.lengthMm, `${input.pieceName} lengthMm`);
  assertPositive(input.widthMm, `${input.pieceName} widthMm`);

  if (input.thicknessMm !== null) {
    assertPositive(input.thicknessMm, `${input.pieceName} thicknessMm`);
  }

  return {
    module_name: input.moduleName,
    piece_name: input.pieceName,
    quantity: input.quantity,
    length_mm: roundMeasure(input.lengthMm),
    width_mm: roundMeasure(input.widthMm),
    thickness_mm: input.thicknessMm === null ? null : roundMeasure(input.thicknessMm),
    edge_front_mm: input.edgeFrontMm ?? 0,
    edge_back_mm: input.edgeBackMm ?? 0,
    edge_left_mm: input.edgeLeftMm ?? 0,
    edge_right_mm: input.edgeRightMm ?? 0,
    grain_direction: input.grainDirection,
    notes: input.notes,
  };
}

function assertPositive(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${fieldName} must be a finite number greater than 0.`);
  }
}

function assertPositiveInteger(value: number | undefined, fieldName: string): void {
  if (value === undefined || !Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${fieldName} must be a positive integer.`);
  }
}

function assertNonNegativeInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${fieldName} must be an integer greater than or equal to 0.`);
  }
}

function roundMeasure(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
