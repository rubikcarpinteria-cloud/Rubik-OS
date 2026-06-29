import type { KitchenBaseCabinetInput, KitchenBaseCabinetModuleInput } from './types.js';
import {
  BASE_MODULE_STANDARD_DEPTH_MM,
  BASE_MODULE_STANDARD_HEIGHT_MM,
  getBaseModuleByCode,
  type PredefinedBaseModule,
} from './baseModuleCatalog.js';

export type SelectedBaseModule = {
  moduleCode: string;
  customWidthMm: number | null;
  position: number;
  notes: string | null;
};

export type BaseModuleCompositionInput = {
  availableWidthMm: number;
  selectedModules: readonly SelectedBaseModule[];
  allowFiller: boolean;
  toleranceMm: number;
};

export type ComposedBaseModule = {
  selected: SelectedBaseModule;
  catalogModule: PredefinedBaseModule;
  widthMm: number;
  position: number;
  notes: string[];
};

export type BaseModuleCompositionResult = {
  availableWidthMm: number;
  totalSelectedWidthMm: number;
  differenceMm: number;
  fits: boolean;
  needsFiller: boolean;
  suggestedFillerWidthMm: number | null;
  modules: ComposedBaseModule[];
  warnings: string[];
  notes: string[];
  requiresDiegoValidation: true;
};

export type CreateKitchenBaseDesignInputFromBaseCompositionInput = {
  composition: BaseModuleCompositionResult;
  heightMm?: number;
  depthMm?: number;
  materialThicknessMm?: number;
  backPanelThicknessMm?: number;
  hasBackPanel?: boolean;
  hasToeKick?: boolean;
  toeKickHeightMm?: number;
};

export type KitchenBaseDesignInputFromBaseCompositionResult = {
  designInput: KitchenBaseCabinetInput;
  warnings: string[];
  notes: string[];
  requiresDiegoValidation: true;
};

const PRELIMINARY_COMPOSITION_NOTE =
  'Composición modular preliminar. No aprobar corte ni cotización final sin validación de Diego.';

export function composeBaseModulesForAvailableWidth(
  input: BaseModuleCompositionInput,
): BaseModuleCompositionResult {
  const warnings: string[] = [];
  const notes = [PRELIMINARY_COMPOSITION_NOTE];
  const modules = input.selectedModules
    .slice()
    .sort((left, right) => left.position - right.position)
    .flatMap((selected): ComposedBaseModule[] => {
      const catalogModule = getBaseModuleByCode(selected.moduleCode);

      if (catalogModule === undefined) {
        warnings.push(`El módulo ${selected.moduleCode} no existe en el catálogo base.`);
        return [];
      }

      const widthMm = selected.customWidthMm ?? catalogModule.widthMm;

      if (!Number.isFinite(widthMm) || widthMm <= 0) {
        warnings.push(`El módulo ${selected.moduleCode} tiene un ancho inválido.`);
        return [];
      }

      return [
        {
          selected,
          catalogModule,
          widthMm,
          position: selected.position,
          notes:
            selected.notes === null
              ? [...catalogModule.notes]
              : [...catalogModule.notes, selected.notes],
        },
      ];
    });

  const totalSelectedWidthMm = modules.reduce((total, module) => total + module.widthMm, 0);
  const differenceMm = input.availableWidthMm - totalSelectedWidthMm;
  const absoluteDifferenceMm = Math.abs(differenceMm);
  const isWithinTolerance = absoluteDifferenceMm <= input.toleranceMm;
  const needsFiller = differenceMm > input.toleranceMm;
  const suggestedFillerWidthMm =
    needsFiller && input.allowFiller ? roundMeasure(differenceMm) : null;
  const fits = isWithinTolerance || suggestedFillerWidthMm !== null;

  if (!Number.isFinite(input.availableWidthMm) || input.availableWidthMm <= 0) {
    warnings.push('El ancho disponible debe ser mayor a 0 mm.');
  }

  if (differenceMm < -input.toleranceMm) {
    warnings.push(
      `Los módulos seleccionados superan el ancho disponible por ${roundMeasure(Math.abs(differenceMm))} mm.`,
    );
  }

  if (needsFiller && input.allowFiller) {
    warnings.push(
      `Falta cubrir ${roundMeasure(differenceMm)} mm. Se sugiere módulo de ajuste/relleno.`,
    );
  }

  if (needsFiller && !input.allowFiller) {
    warnings.push(
      `Falta cubrir ${roundMeasure(differenceMm)} mm y no se permite sugerir relleno automáticamente.`,
    );
  }

  return {
    availableWidthMm: input.availableWidthMm,
    totalSelectedWidthMm: roundMeasure(totalSelectedWidthMm),
    differenceMm: roundMeasure(differenceMm),
    fits,
    needsFiller,
    suggestedFillerWidthMm,
    modules,
    warnings,
    notes,
    requiresDiegoValidation: true,
  };
}

export function createKitchenBaseDesignInputFromBaseComposition(
  input: CreateKitchenBaseDesignInputFromBaseCompositionInput,
): KitchenBaseDesignInputFromBaseCompositionResult {
  const warnings = [...input.composition.warnings];
  const modules = input.composition.modules.map((module): KitchenBaseCabinetModuleInput => {
    if (module.catalogModule.type === 'drawers') {
      return {
        name: module.catalogModule.name,
        widthMm: module.widthMm,
        type: 'drawers',
        drawers: Math.max(1, module.catalogModule.drawers),
      };
    }

    if (module.catalogModule.type !== 'doors') {
      warnings.push(
        `El módulo ${module.catalogModule.code} es tipo ${module.catalogModule.type}; se adapta provisionalmente como módulo de puertas para KitchenBaseCabinet v0.`,
      );
    }

    return {
      name: module.catalogModule.name,
      widthMm: module.widthMm,
      type: 'doors',
      doors: Math.max(1, module.catalogModule.doors),
      shelves: module.catalogModule.shelves,
    };
  });

  return {
    designInput: {
      widthMm: input.composition.availableWidthMm,
      heightMm: input.heightMm ?? BASE_MODULE_STANDARD_HEIGHT_MM,
      depthMm: input.depthMm ?? BASE_MODULE_STANDARD_DEPTH_MM,
      materialThicknessMm: input.materialThicknessMm ?? 18,
      backPanelThicknessMm: input.backPanelThicknessMm ?? 3,
      hasBackPanel: input.hasBackPanel ?? true,
      hasToeKick: input.hasToeKick ?? true,
      toeKickHeightMm: input.toeKickHeightMm ?? 100,
      modules,
    },
    warnings,
    notes: [
      ...input.composition.notes,
      'Design input generado desde módulos bajos prediseñados. Requiere validación de Diego.',
    ],
    requiresDiegoValidation: true,
  };
}

function roundMeasure(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
