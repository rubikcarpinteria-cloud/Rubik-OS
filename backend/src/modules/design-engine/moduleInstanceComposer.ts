import { getModuleTemplateByCode, type ModuleTemplate } from './moduleTemplateCatalog.js';

export type ModuleInstance = {
  id: string;
  templateCode: string;
  template: ModuleTemplate;
  name: string;
  position: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  doors: number;
  drawers: number;
  shelves: number;
  accessories: string[];
  autoAdjustments: string[];
  requiresDiegoValidation: true;
};

export type CreateModuleInstanceFromTemplateInput = {
  templateCode: string;
  id?: string;
  position: number;
  widthMm?: number;
  accessories?: string[];
};

export type ComposeModuleInstancesOnWallInput = {
  availableWidthMm: number;
  instances: readonly ModuleInstance[];
  toleranceMm: number;
};

export type ModuleWallCompositionResult = {
  availableWidthMm: number;
  usedWidthMm: number;
  remainingWidthMm: number;
  overflowWidthMm: number;
  fits: boolean;
  instances: ModuleInstance[];
  warnings: string[];
  notes: string[];
  requiresDiegoValidation: true;
};

const WALL_COMPOSITION_NOTE =
  'Armado modular preliminar tipo biblioteca. No fabricar sin validación de Diego.';

export function createModuleInstanceFromTemplate(
  input: CreateModuleInstanceFromTemplateInput,
): ModuleInstance {
  const template = getModuleTemplateByCode(input.templateCode);

  if (template === undefined) {
    throw new Error(`La plantilla ${input.templateCode} no existe en la biblioteca de módulos.`);
  }

  const widthMm = input.widthMm ?? template.adjustableWidth.defaultMm;

  return applyTemplateRules({
    id: input.id ?? `${template.code}-${input.position}`,
    templateCode: template.code,
    template,
    name: template.name,
    position: input.position,
    widthMm,
    heightMm: template.defaultHeightMm,
    depthMm: template.defaultDepthMm,
    doors: template.doorRules.defaultDoors,
    drawers: template.kind === 'base_drawers' ? 3 : 0,
    shelves: template.shelfRules.defaultShelves,
    accessories: [...template.accessoryRules.defaultAccessories, ...(input.accessories ?? [])],
    autoAdjustments: [],
    requiresDiegoValidation: true,
  });
}

export function updateModuleInstanceWidth(
  instance: ModuleInstance,
  widthMm: number,
): ModuleInstance {
  return applyTemplateRules({
    ...instance,
    widthMm,
    autoAdjustments: [],
  });
}

export function composeModuleInstancesOnWall(
  input: ComposeModuleInstancesOnWallInput,
): ModuleWallCompositionResult {
  const warnings: string[] = [];
  const sortedInstances = input.instances
    .slice()
    .sort((left, right) => left.position - right.position);
  const usedWidthMm = roundMeasure(
    sortedInstances.reduce((total, instance) => total + instance.widthMm, 0),
  );
  const rawDifferenceMm = roundMeasure(input.availableWidthMm - usedWidthMm);
  const remainingWidthMm = Math.max(rawDifferenceMm, 0);
  const overflowWidthMm = Math.max(roundMeasure(usedWidthMm - input.availableWidthMm), 0);
  const fits = overflowWidthMm <= input.toleranceMm;

  if (!Number.isFinite(input.availableWidthMm) || input.availableWidthMm <= 0) {
    warnings.push('El ancho disponible de pared debe ser mayor a 0 mm.');
  }

  for (const instance of sortedInstances) {
    const { adjustableWidth } = instance.template;

    if (instance.widthMm < adjustableWidth.minMm || instance.widthMm > adjustableWidth.maxMm) {
      warnings.push(
        `${instance.name} está fuera del rango recomendado (${adjustableWidth.minMm}-${adjustableWidth.maxMm} mm).`,
      );
    }
  }

  if (remainingWidthMm > input.toleranceMm) {
    warnings.push(`Quedan ${remainingWidthMm} mm libres para relleno, ajuste o nuevo módulo.`);
  }

  if (overflowWidthMm > input.toleranceMm) {
    warnings.push(`Los módulos superan el ancho disponible por ${overflowWidthMm} mm.`);
  }

  return {
    availableWidthMm: input.availableWidthMm,
    usedWidthMm,
    remainingWidthMm: roundMeasure(remainingWidthMm),
    overflowWidthMm: roundMeasure(overflowWidthMm),
    fits,
    instances: sortedInstances,
    warnings,
    notes: [WALL_COMPOSITION_NOTE],
    requiresDiegoValidation: true,
  };
}

function applyTemplateRules(instance: ModuleInstance): ModuleInstance {
  const autoAdjustments: string[] = [];
  let doors = instance.doors;

  if (instance.template.doorRules.enabled) {
    const { defaultDoors, singleDoorMaxWidthMm } = instance.template.doorRules;
    const nextDoors =
      singleDoorMaxWidthMm !== null && instance.widthMm <= singleDoorMaxWidthMm ? 1 : defaultDoors;

    if (nextDoors !== defaultDoors) {
      autoAdjustments.push(
        `Ajuste automático: ancho ${instance.widthMm} mm usa ${nextDoors} puerta.`,
      );
    }

    doors = nextDoors;
  }

  return {
    ...instance,
    doors,
    autoAdjustments,
  };
}

function roundMeasure(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
