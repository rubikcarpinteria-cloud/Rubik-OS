export type BaseModuleType = 'doors' | 'drawers' | 'open_shelves' | 'sink' | 'filler' | 'oven';

export type PredefinedBaseModule = {
  code: string;
  name: string;
  type: BaseModuleType;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  doors: number;
  drawers: number;
  shelves: number;
  accessories: string[];
  notes: string[];
  requiresDiegoValidation: true;
};

export const BASE_MODULE_STANDARD_HEIGHT_MM = 720;
export const BASE_MODULE_STANDARD_DEPTH_MM = 620;

const DIEGO_VALIDATION_NOTE =
  'Módulo preliminar ajustable según obra. Requiere validación de Diego.';

export const baseModuleCatalog: readonly PredefinedBaseModule[] = [
  createBaseModule('BASE_DOORS_300', 'Módulo bajo puertas 300', 'doors', 300, {
    doors: 1,
    shelves: 1,
    accessories: ['bisagras', 'tirador', 'estante regulable'],
  }),
  createBaseModule('BASE_DOORS_400', 'Módulo bajo puertas 400', 'doors', 400, {
    doors: 1,
    shelves: 1,
    accessories: ['bisagras', 'tirador', 'estante regulable'],
  }),
  createBaseModule('BASE_DOORS_500', 'Módulo bajo puertas 500', 'doors', 500, {
    doors: 1,
    shelves: 1,
    accessories: ['bisagras', 'tirador', 'estante regulable'],
  }),
  createBaseModule('BASE_DOORS_600', 'Módulo bajo puertas 600', 'doors', 600, {
    doors: 2,
    shelves: 1,
    accessories: ['bisagras', 'tiradores', 'estante regulable'],
  }),
  createBaseModule('BASE_DOORS_800_DOUBLE', 'Módulo bajo puertas doble 800', 'doors', 800, {
    doors: 2,
    shelves: 1,
    accessories: ['bisagras', 'tiradores', 'estante regulable'],
  }),
  createBaseModule('BASE_DOORS_900_DOUBLE', 'Módulo bajo puertas doble 900', 'doors', 900, {
    doors: 2,
    shelves: 1,
    accessories: ['bisagras', 'tiradores', 'estante regulable'],
  }),
  createBaseModule('BASE_DRAWERS_400_3', 'Cajonera baja 400 con 3 cajones', 'drawers', 400, {
    drawers: 3,
    accessories: ['correderas', 'tiradores'],
  }),
  createBaseModule('BASE_DRAWERS_500_3', 'Cajonera baja 500 con 3 cajones', 'drawers', 500, {
    drawers: 3,
    accessories: ['correderas', 'tiradores'],
  }),
  createBaseModule('BASE_DRAWERS_600_3', 'Cajonera baja 600 con 3 cajones', 'drawers', 600, {
    drawers: 3,
    accessories: ['correderas', 'tiradores'],
  }),
  createBaseModule('BASE_OPEN_300', 'Módulo bajo abierto 300', 'open_shelves', 300, {
    shelves: 2,
    accessories: ['estantes abiertos'],
    notes: ['Módulo abierto: validar terminaciones visibles y cantos.'],
  }),
  createBaseModule('BASE_SINK_600', 'Módulo bajo piletero 600', 'sink', 600, {
    doors: 2,
    accessories: ['bisagras', 'tiradores', 'calados para instalaciones'],
    notes: ['Módulo piletero: validar bacha, sifón, agua, gas y desagüe antes de fabricar.'],
  }),
  createBaseModule('BASE_FILLER_50', 'Relleno bajo 50', 'filler', 50, {
    accessories: ['pieza de ajuste'],
    notes: ['Relleno técnico para absorber diferencias de obra.'],
  }),
  createBaseModule('BASE_FILLER_100', 'Relleno bajo 100', 'filler', 100, {
    accessories: ['pieza de ajuste'],
    notes: ['Relleno técnico para absorber diferencias de obra.'],
  }),
];

export function getPredefinedBaseModules(): readonly PredefinedBaseModule[] {
  return baseModuleCatalog;
}

export function getBaseModuleByCode(code: string): PredefinedBaseModule | undefined {
  return baseModuleCatalog.find((module) => module.code === code);
}

export function getBaseModulesByType(type: BaseModuleType): readonly PredefinedBaseModule[] {
  return baseModuleCatalog.filter((module) => module.type === type);
}

export function getBaseModulesByWidth(widthMm: number): readonly PredefinedBaseModule[] {
  return baseModuleCatalog.filter((module) => module.widthMm === widthMm);
}

export function isBaseFillerModule(module: Pick<PredefinedBaseModule, 'type'>): boolean {
  return module.type === 'filler';
}

function createBaseModule(
  code: string,
  name: string,
  type: BaseModuleType,
  widthMm: number,
  options: {
    doors?: number;
    drawers?: number;
    shelves?: number;
    accessories?: string[];
    notes?: string[];
  } = {},
): PredefinedBaseModule {
  return {
    code,
    name,
    type,
    widthMm,
    heightMm: BASE_MODULE_STANDARD_HEIGHT_MM,
    depthMm: BASE_MODULE_STANDARD_DEPTH_MM,
    doors: options.doors ?? 0,
    drawers: options.drawers ?? 0,
    shelves: options.shelves ?? 0,
    accessories: [...(options.accessories ?? [])],
    notes: [DIEGO_VALIDATION_NOTE, ...(options.notes ?? [])],
    requiresDiegoValidation: true,
  };
}
