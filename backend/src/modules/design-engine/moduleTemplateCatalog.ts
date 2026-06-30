export type ModuleTemplateCategory = 'base' | 'wall' | 'tall' | 'corner' | 'terminal';

export type ModuleTemplateKind =
  | 'base_doors'
  | 'base_drawers'
  | 'base_sink'
  | 'base_oven'
  | 'base_dishwasher'
  | 'base_narrow_organizer'
  | 'wall_doors'
  | 'wall_lift_up'
  | 'tall_pantry'
  | 'tall_oven_microwave'
  | 'corner'
  | 'terminal';

export type AdjustableWidthRule = {
  enabled: boolean;
  defaultMm: number;
  minMm: number;
  maxMm: number;
  stepMm: number;
};

export type ConstructionRules = {
  material: 'melamina';
  materialThicknessMm: number;
  finalDepthIncludesFronts: boolean;
  recessedBackPanel: boolean;
  upperReinforcement: boolean;
  rearReinforcement: boolean;
};

export type EdgeBandingRules = {
  visibleEdgeMm: number;
  frontEdges: 'visible_fronts' | 'all_visible_edges' | 'none';
};

export type DoorRules = {
  enabled: boolean;
  defaultDoors: number;
  singleDoorMaxWidthMm: number | null;
  lateralGapMm: number;
};

export type ShelfRules = {
  enabled: boolean;
  defaultShelves: number;
};

export type BackPanelRules = {
  enabled: boolean;
  recessed: boolean;
  thicknessMm: number;
};

export type ReinforcementRules = {
  upper: boolean;
  rear: boolean;
};

export type AccessoryRules = {
  defaultAccessories: string[];
  optionalAccessories: string[];
  allowsManualAdvancedConfig: boolean;
};

export type ValidationRules = {
  requiresDiegoValidation: true;
  notes: string[];
};

export type ModuleTemplate = {
  code: string;
  name: string;
  category: ModuleTemplateCategory;
  kind: ModuleTemplateKind;
  adjustableWidth: AdjustableWidthRule;
  defaultHeightMm: number;
  defaultDepthMm: number;
  constructionRules: ConstructionRules;
  edgeBandingRules: EdgeBandingRules;
  doorRules: DoorRules;
  shelfRules: ShelfRules;
  backPanelRules: BackPanelRules;
  reinforcementRules: ReinforcementRules;
  accessoryRules: AccessoryRules;
  validationRules: ValidationRules;
  notes: string[];
};

const BASE_HEIGHT_MM = 720;
const BASE_DEPTH_WITH_FRONTS_MM = 620;
const WALL_HEIGHT_MM = 700;
const WALL_DEPTH_MM = 320;
const TALL_HEIGHT_MM = 2100;
const TALL_DEPTH_MM = 620;
const DEFAULT_MELAMINE_THICKNESS_MM = 18;
const DEFAULT_BACK_PANEL_THICKNESS_MM = 3;
const DEFAULT_VISIBLE_EDGE_MM = 2;
const DEFAULT_DOOR_LATERAL_GAP_MM = 2;
const DIEGO_VALIDATION_NOTE =
  'Plantilla estándar preliminar. Requiere validación de Diego antes de fabricar.';

export const moduleTemplateCatalog: readonly ModuleTemplate[] = [
  createTemplate('BASE_DOORS_STANDARD', 'Bajo mesada con puertas', 'base', 'base_doors', {
    defaultWidthMm: 800,
    minWidthMm: 300,
    maxWidthMm: 1200,
    defaultDoors: 2,
    singleDoorMaxWidthMm: 450,
    shelves: 1,
    defaultAccessories: ['bisagras', 'tiradores', 'estante medio'],
    optionalAccessories: ['cesto extraíble', 'organizador interior', 'bisagra con freno'],
  }),
  createTemplate('BASE_DRAWERS_STANDARD', 'Bajo mesada cajonera', 'base', 'base_drawers', {
    defaultWidthMm: 560,
    minWidthMm: 350,
    maxWidthMm: 900,
    drawers: 3,
    defaultAccessories: ['correderas telescópicas', 'tiradores'],
    optionalAccessories: ['correderas soft close', 'organizador cubiertero'],
  }),
  createTemplate('BASE_SINK_STANDARD', 'Bajo mesada bacha', 'base', 'base_sink', {
    defaultWidthMm: 800,
    minWidthMm: 600,
    maxWidthMm: 1200,
    defaultDoors: 2,
    singleDoorMaxWidthMm: 450,
    defaultAccessories: ['bisagras', 'tiradores', 'protección para humedad'],
    optionalAccessories: ['cesto de residuos', 'base reforzada', 'calado sanitario'],
    notes: ['Validar bacha, sifón, agua, gas y desagüe antes de fabricar.'],
  }),
  createTemplate('BASE_OVEN_STANDARD', 'Bajo mesada horno empotrado', 'base', 'base_oven', {
    defaultWidthMm: 600,
    minWidthMm: 560,
    maxWidthMm: 700,
    defaultAccessories: ['refuerzos laterales', 'ventilación técnica'],
    optionalAccessories: ['cajón inferior', 'frente fijo superior'],
    allowsManualAdvancedConfig: true,
    notes: ['Validar manual técnico del horno antes de fabricar.'],
  }),
  createTemplate(
    'BASE_DISHWASHER_STANDARD',
    'Bajo mesada lavavajillas',
    'base',
    'base_dishwasher',
    {
      defaultWidthMm: 600,
      minWidthMm: 450,
      maxWidthMm: 700,
      defaultAccessories: ['espacio técnico libre', 'tapacantos visibles'],
      optionalAccessories: ['frente panelable', 'zócalo desmontable'],
      allowsManualAdvancedConfig: true,
      notes: ['Validar modelo de lavavajillas, toma de agua y desagüe.'],
    },
  ),
  createTemplate(
    'BASE_NARROW_ORGANIZER_STANDARD',
    'Bajo mesada organizador angosto',
    'base',
    'base_narrow_organizer',
    {
      defaultWidthMm: 300,
      minWidthMm: 150,
      maxWidthMm: 400,
      defaultAccessories: ['canasto extraíble angosto', 'correderas'],
      optionalAccessories: ['botellero', 'especiero'],
      allowsManualAdvancedConfig: true,
    },
  ),
  createTemplate('WALL_DOORS_STANDARD', 'Alacena con puertas', 'wall', 'wall_doors', {
    defaultWidthMm: 800,
    minWidthMm: 300,
    maxWidthMm: 1200,
    defaultHeightMm: WALL_HEIGHT_MM,
    defaultDepthMm: WALL_DEPTH_MM,
    defaultDoors: 2,
    singleDoorMaxWidthMm: 450,
    shelves: 1,
    defaultAccessories: ['bisagras', 'tiradores', 'estante regulable'],
    optionalAccessories: ['bisagra con freno', 'luz led interior'],
  }),
  createTemplate('WALL_LIFT_UP_STANDARD', 'Alacena volcable', 'wall', 'wall_lift_up', {
    defaultWidthMm: 800,
    minWidthMm: 500,
    maxWidthMm: 1200,
    defaultHeightMm: 360,
    defaultDepthMm: WALL_DEPTH_MM,
    defaultDoors: 1,
    defaultAccessories: ['pistón o aventos', 'frente volcable'],
    optionalAccessories: ['sistema elevable premium'],
    allowsManualAdvancedConfig: true,
  }),
  createTemplate('TALL_PANTRY_STANDARD', 'Columna despensa', 'tall', 'tall_pantry', {
    defaultWidthMm: 600,
    minWidthMm: 400,
    maxWidthMm: 900,
    defaultHeightMm: TALL_HEIGHT_MM,
    defaultDepthMm: TALL_DEPTH_MM,
    defaultDoors: 2,
    singleDoorMaxWidthMm: 450,
    shelves: 4,
    defaultAccessories: ['estantes regulables', 'bisagras reforzadas', 'tiradores'],
    optionalAccessories: ['cajones internos', 'despensero extraíble'],
  }),
  createTemplate(
    'TALL_OVEN_MICRO_STANDARD',
    'Columna horno/microondas',
    'tall',
    'tall_oven_microwave',
    {
      defaultWidthMm: 600,
      minWidthMm: 560,
      maxWidthMm: 700,
      defaultHeightMm: TALL_HEIGHT_MM,
      defaultDepthMm: TALL_DEPTH_MM,
      shelves: 1,
      defaultAccessories: ['nichos técnicos', 'refuerzos', 'ventilación'],
      optionalAccessories: ['cajón inferior', 'puerta superior'],
      allowsManualAdvancedConfig: true,
      notes: ['Validar manuales técnicos de horno y microondas.'],
    },
  ),
  createTemplate('CORNER_STANDARD', 'Módulo esquina', 'corner', 'corner', {
    defaultWidthMm: 900,
    minWidthMm: 800,
    maxWidthMm: 1200,
    defaultAccessories: ['herrajes de esquina', 'puerta plegable o ciega'],
    optionalAccessories: ['rinconero extraíble', 'bandeja giratoria'],
    allowsManualAdvancedConfig: true,
    notes: ['Validar mano de apertura y encuentro con módulos vecinos.'],
  }),
  createTemplate('TERMINAL_STANDARD', 'Módulo terminal', 'terminal', 'terminal', {
    defaultWidthMm: 300,
    minWidthMm: 150,
    maxWidthMm: 450,
    defaultAccessories: ['terminación vista', 'cantos visibles'],
    optionalAccessories: ['estantes redondeados', 'lateral decorativo'],
    allowsManualAdvancedConfig: true,
  }),
];

export function getModuleTemplates(): readonly ModuleTemplate[] {
  return moduleTemplateCatalog;
}

export function getModuleTemplateByCode(code: string): ModuleTemplate | undefined {
  return moduleTemplateCatalog.find((template) => template.code === code);
}

export function getModuleTemplatesByCategory(
  category: ModuleTemplateCategory,
): readonly ModuleTemplate[] {
  return moduleTemplateCatalog.filter((template) => template.category === category);
}

function createTemplate(
  code: string,
  name: string,
  category: ModuleTemplateCategory,
  kind: ModuleTemplateKind,
  options: {
    defaultWidthMm: number;
    minWidthMm: number;
    maxWidthMm: number;
    defaultHeightMm?: number;
    defaultDepthMm?: number;
    defaultDoors?: number;
    singleDoorMaxWidthMm?: number;
    drawers?: number;
    shelves?: number;
    defaultAccessories?: string[];
    optionalAccessories?: string[];
    allowsManualAdvancedConfig?: boolean;
    notes?: string[];
  },
): ModuleTemplate {
  const defaultHeightMm = options.defaultHeightMm ?? BASE_HEIGHT_MM;
  const defaultDepthMm = options.defaultDepthMm ?? BASE_DEPTH_WITH_FRONTS_MM;

  return {
    code,
    name,
    category,
    kind,
    adjustableWidth: {
      enabled: true,
      defaultMm: options.defaultWidthMm,
      minMm: options.minWidthMm,
      maxMm: options.maxWidthMm,
      stepMm: 10,
    },
    defaultHeightMm,
    defaultDepthMm,
    constructionRules: {
      material: 'melamina',
      materialThicknessMm: DEFAULT_MELAMINE_THICKNESS_MM,
      finalDepthIncludesFronts: true,
      recessedBackPanel: true,
      upperReinforcement: category === 'base' || category === 'tall',
      rearReinforcement: category === 'base' || category === 'tall',
    },
    edgeBandingRules: {
      visibleEdgeMm: DEFAULT_VISIBLE_EDGE_MM,
      frontEdges: 'visible_fronts',
    },
    doorRules: {
      enabled: (options.defaultDoors ?? 0) > 0,
      defaultDoors: options.defaultDoors ?? 0,
      singleDoorMaxWidthMm: options.singleDoorMaxWidthMm ?? null,
      lateralGapMm: DEFAULT_DOOR_LATERAL_GAP_MM,
    },
    shelfRules: {
      enabled: (options.shelves ?? 0) > 0,
      defaultShelves: options.shelves ?? 0,
    },
    backPanelRules: {
      enabled: true,
      recessed: true,
      thicknessMm: DEFAULT_BACK_PANEL_THICKNESS_MM,
    },
    reinforcementRules: {
      upper: category === 'base' || category === 'tall',
      rear: category === 'base' || category === 'tall',
    },
    accessoryRules: {
      defaultAccessories: [...(options.defaultAccessories ?? [])],
      optionalAccessories: [...(options.optionalAccessories ?? [])],
      allowsManualAdvancedConfig: options.allowsManualAdvancedConfig ?? false,
    },
    validationRules: {
      requiresDiegoValidation: true,
      notes: [DIEGO_VALIDATION_NOTE],
    },
    notes: [DIEGO_VALIDATION_NOTE, ...(options.notes ?? [])],
  };
}
