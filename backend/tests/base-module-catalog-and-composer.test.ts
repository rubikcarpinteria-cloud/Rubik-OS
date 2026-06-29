import { describe, expect, it } from 'vitest';

import {
  composeBaseModulesForAvailableWidth,
  createKitchenBaseDesignInputFromBaseComposition,
  getBaseModuleByCode,
  getBaseModulesByType,
  getPredefinedBaseModules,
  isBaseFillerModule,
} from '../src/modules/design-engine/index.js';

function createExactComposition() {
  return composeBaseModulesForAvailableWidth({
    availableWidthMm: 1800,
    allowFiller: false,
    toleranceMm: 0,
    selectedModules: [
      { moduleCode: 'BASE_DOORS_800_DOUBLE', customWidthMm: null, position: 1, notes: null },
      { moduleCode: 'BASE_DRAWERS_400_3', customWidthMm: null, position: 2, notes: null },
      { moduleCode: 'BASE_DOORS_600', customWidthMm: null, position: 3, notes: null },
    ],
  });
}

describe('base module catalog and composer', () => {
  it('returns predefined base modules', () => {
    const modules = getPredefinedBaseModules();

    expect(modules.length).toBeGreaterThan(0);
    expect(modules.map((module) => module.code)).toEqual(
      expect.arrayContaining(['BASE_DOORS_300', 'BASE_FILLER_100']),
    );
  });

  it('finds a base module by code', () => {
    expect(getBaseModuleByCode('BASE_DRAWERS_600_3')).toMatchObject({
      code: 'BASE_DRAWERS_600_3',
      type: 'drawers',
      drawers: 3,
      widthMm: 600,
    });
  });

  it('filters modules by type', () => {
    expect(getBaseModulesByType('drawers').every((module) => module.type === 'drawers')).toBe(true);
  });

  it('composes modules that exactly match the available width', () => {
    const composition = createExactComposition();

    expect(composition).toMatchObject({
      availableWidthMm: 1800,
      totalSelectedWidthMm: 1800,
      differenceMm: 0,
      fits: true,
      needsFiller: false,
      suggestedFillerWidthMm: null,
      requiresDiegoValidation: true,
    });
    expect(composition.warnings).toEqual([]);
  });

  it('detects when selected modules exceed the available width', () => {
    const composition = composeBaseModulesForAvailableWidth({
      availableWidthMm: 1000,
      allowFiller: false,
      toleranceMm: 0,
      selectedModules: [
        { moduleCode: 'BASE_DOORS_800_DOUBLE', customWidthMm: null, position: 1, notes: null },
        { moduleCode: 'BASE_DRAWERS_600_3', customWidthMm: null, position: 2, notes: null },
      ],
    });

    expect(composition.fits).toBe(false);
    expect(composition.warnings).toContain(
      'Los módulos seleccionados superan el ancho disponible por 400 mm.',
    );
  });

  it('suggests filler when there is remaining space and filler is allowed', () => {
    const composition = composeBaseModulesForAvailableWidth({
      availableWidthMm: 1900,
      allowFiller: true,
      toleranceMm: 0,
      selectedModules: [
        { moduleCode: 'BASE_DOORS_800_DOUBLE', customWidthMm: null, position: 1, notes: null },
        { moduleCode: 'BASE_DRAWERS_600_3', customWidthMm: null, position: 2, notes: null },
      ],
    });

    expect(composition.fits).toBe(true);
    expect(composition.needsFiller).toBe(true);
    expect(composition.suggestedFillerWidthMm).toBe(500);
  });

  it('converts a composition to kitchen base cabinet design input', () => {
    const result = createKitchenBaseDesignInputFromBaseComposition({
      composition: createExactComposition(),
    });

    expect(result.designInput.widthMm).toBe(1800);
    expect(result.designInput.heightMm).toBe(720);
    expect(result.designInput.depthMm).toBe(620);
    expect(result.designInput.modules).toHaveLength(3);
    expect(result.requiresDiegoValidation).toBe(true);
  });

  it('preserves module accessories for doors, drawers and shelves in the composition', () => {
    const composition = createExactComposition();

    expect(composition.modules[0]?.catalogModule.doors).toBe(2);
    expect(composition.modules[1]?.catalogModule.drawers).toBe(3);
    expect(composition.modules[2]?.catalogModule.shelves).toBe(1);
  });

  it('always requires Diego validation', () => {
    expect(getPredefinedBaseModules().every((module) => module.requiresDiegoValidation)).toBe(true);
    expect(createExactComposition().requiresDiegoValidation).toBe(true);
  });

  it('creates a valid 3070 mm composition with custom module widths', () => {
    const composition = composeBaseModulesForAvailableWidth({
      availableWidthMm: 3070,
      allowFiller: false,
      toleranceMm: 0,
      selectedModules: [
        { moduleCode: 'BASE_DOORS_800_DOUBLE', customWidthMm: 800, position: 1, notes: null },
        { moduleCode: 'BASE_DRAWERS_600_3', customWidthMm: 560, position: 2, notes: null },
        { moduleCode: 'BASE_DOORS_900_DOUBLE', customWidthMm: 1000, position: 3, notes: null },
        { moduleCode: 'BASE_FILLER_100', customWidthMm: 710, position: 4, notes: null },
      ],
    });

    expect(composition.fits).toBe(true);
    expect(composition.totalSelectedWidthMm).toBe(3070);
    expect(composition.differenceMm).toBe(0);
    const fillerModule = composition.modules[3]?.catalogModule;

    expect(fillerModule).toBeDefined();
    expect(fillerModule === undefined ? false : isBaseFillerModule(fillerModule)).toBe(true);
  });
});
