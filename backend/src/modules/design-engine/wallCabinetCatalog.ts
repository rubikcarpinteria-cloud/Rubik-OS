export type WallCabinetModuleKind = 'single_door' | 'double_door' | 'ambiguous' | 'special';

export type WallCabinetCatalogModule = {
  code: string;
  name: string;
  widthCm: number;
  widthMm: number;
  kind: WallCabinetModuleKind;
  doors: number | null;
  shelves: number | null;
  sourcePages: [2, 5];
  requiresDiegoValidation: true;
  notes: string[];
};

export type WallCabinetWidthClassification = {
  widthCm: number;
  kind: WallCabinetModuleKind;
  warnings: string[];
  requiresDiegoValidation: true;
};

export const WALL_CABINET_SINGLE_DOOR_WIDTHS_CM = [30, 40, 45, 50, 60] as const;
export const WALL_CABINET_DOUBLE_DOOR_WIDTHS_CM = [60, 80, 90, 100, 120] as const;
export const WALL_CABINET_AMBIGUOUS_WIDTHS_CM = [60] as const;
export const WALL_CABINET_REFERENCE_HEIGHT_LINES_CM = [
  12, 15, 84, 87, 147, 150, 179, 182, 211, 214, 243, 246,
] as const;
export const WALL_CABINET_REFERENCE_DEPTHS_CM = [32, 33.5, 59] as const;

const SOURCE_PAGES: [2, 5] = [2, 5];
const DIEGO_VALIDATION_NOTE =
  'Referencia preliminar: requiere validación de Diego antes de fabricar.';

export const wallCabinetCatalog: readonly WallCabinetCatalogModule[] = [
  createWallCabinetModule('WALL_SINGLE_300', 'Alacena simple 30 cm', 30, 'single_door', 1),
  createWallCabinetModule('WALL_SINGLE_400', 'Alacena simple 40 cm', 40, 'single_door', 1),
  createWallCabinetModule('WALL_SINGLE_450', 'Alacena simple 45 cm', 45, 'single_door', 1),
  createWallCabinetModule('WALL_SINGLE_500', 'Alacena simple 50 cm', 50, 'single_door', 1),
  createWallCabinetModule('WALL_SINGLE_600', 'Alacena simple 60 cm', 60, 'ambiguous', 1, [
    'El ancho 60 cm también existe como referencia doble; validar configuración de puertas.',
  ]),
  createWallCabinetModule('WALL_DOUBLE_600', 'Alacena doble 60 cm', 60, 'ambiguous', 2, [
    'El ancho 60 cm también existe como referencia simple; validar configuración de puertas.',
  ]),
  createWallCabinetModule('WALL_DOUBLE_800', 'Alacena doble 80 cm', 80, 'double_door', 2),
  createWallCabinetModule('WALL_DOUBLE_900', 'Alacena doble 90 cm', 90, 'double_door', 2),
  createWallCabinetModule('WALL_DOUBLE_1000', 'Alacena doble 100 cm', 100, 'double_door', 2),
  createWallCabinetModule('WALL_DOUBLE_1200', 'Alacena doble 120 cm', 120, 'double_door', 2),
];

export function getWallCabinetCatalog(): readonly WallCabinetCatalogModule[] {
  return wallCabinetCatalog;
}

export function getWallCabinetModuleByCode(code: string): WallCabinetCatalogModule | undefined {
  return wallCabinetCatalog.find((module) => module.code === code);
}

export function getWallCabinetModulesByWidth(widthCm: number): readonly WallCabinetCatalogModule[] {
  return wallCabinetCatalog.filter((module) => module.widthCm === widthCm);
}

export function classifyWallCabinetWidth(widthCm: number): WallCabinetWidthClassification {
  if (isIncludedInReadonlyNumberList(WALL_CABINET_AMBIGUOUS_WIDTHS_CM, widthCm)) {
    return {
      widthCm,
      kind: 'ambiguous',
      warnings: ['El ancho 60 cm puede ser simple o doble; validar configuración con Diego.'],
      requiresDiegoValidation: true,
    };
  }

  if (isIncludedInReadonlyNumberList(WALL_CABINET_SINGLE_DOOR_WIDTHS_CM, widthCm)) {
    return {
      widthCm,
      kind: 'single_door',
      warnings: [],
      requiresDiegoValidation: true,
    };
  }

  if (isIncludedInReadonlyNumberList(WALL_CABINET_DOUBLE_DOOR_WIDTHS_CM, widthCm)) {
    return {
      widthCm,
      kind: 'double_door',
      warnings: [],
      requiresDiegoValidation: true,
    };
  }

  return {
    widthCm,
    kind: 'special',
    warnings: [`El ancho ${widthCm} cm no coincide con modulación estándar del catálogo inicial.`],
    requiresDiegoValidation: true,
  };
}

export function calculateWallCabinetFloorLine(baseCabinetHeightCm: number): number {
  if (!Number.isFinite(baseCabinetHeightCm) || baseCabinetHeightCm <= 0) {
    throw new RangeError('La altura del bajo mesada debe ser mayor a 0 cm.');
  }

  return baseCabinetHeightCm + 63;
}

function createWallCabinetModule(
  code: string,
  name: string,
  widthCm: number,
  kind: WallCabinetModuleKind,
  doors: number,
  extraNotes: string[] = [],
): WallCabinetCatalogModule {
  return {
    code,
    name,
    widthCm,
    widthMm: widthCm * 10,
    kind,
    doors,
    shelves: null,
    sourcePages: [...SOURCE_PAGES],
    requiresDiegoValidation: true,
    notes: [DIEGO_VALIDATION_NOTE, ...extraNotes],
  };
}

function isIncludedInReadonlyNumberList(values: readonly number[], value: number): boolean {
  return values.includes(value);
}
