import { describe, expect, it } from 'vitest';

import {
  calculateWallCabinetFloorLine,
  classifyWallCabinetWidth,
  getWallCabinetCatalog,
  getWallCabinetModuleByCode,
} from '../src/modules/design-engine/index.js';

describe('wall cabinet catalog from manual pages 2 and 5', () => {
  it('returns catalog modules', () => {
    const catalog = getWallCabinetCatalog();

    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog.map((module) => module.code)).toEqual(
      expect.arrayContaining(['WALL_SINGLE_300', 'WALL_DOUBLE_1200']),
    );
  });

  it('finds a module by code', () => {
    expect(getWallCabinetModuleByCode('WALL_DOUBLE_900')).toMatchObject({
      code: 'WALL_DOUBLE_900',
      widthCm: 90,
      widthMm: 900,
      kind: 'double_door',
      doors: 2,
    });
  });

  it('classifies 30 cm as single door', () => {
    expect(classifyWallCabinetWidth(30)).toMatchObject({
      kind: 'single_door',
      warnings: [],
      requiresDiegoValidation: true,
    });
  });

  it('classifies 60 cm as ambiguous', () => {
    const classification = classifyWallCabinetWidth(60);

    expect(classification.kind).toBe('ambiguous');
    expect(classification.warnings).toEqual([
      'El ancho 60 cm puede ser simple o doble; validar configuración con Diego.',
    ]);
  });

  it.each([80, 90, 100, 120])('classifies %s cm as double door', (widthCm) => {
    expect(classifyWallCabinetWidth(widthCm)).toMatchObject({
      kind: 'double_door',
      warnings: [],
    });
  });

  it('classifies 75 cm as special with warning', () => {
    expect(classifyWallCabinetWidth(75)).toEqual({
      widthCm: 75,
      kind: 'special',
      warnings: ['El ancho 75 cm no coincide con modulación estándar del catálogo inicial.'],
      requiresDiegoValidation: true,
    });
  });

  it('calculates wall cabinet floor line from base cabinet height', () => {
    expect(calculateWallCabinetFloorLine(86)).toBe(149);
  });

  it('marks every catalog module as requiring Diego validation', () => {
    expect(getWallCabinetCatalog().every((module) => module.requiresDiegoValidation)).toBe(true);
  });

  it('keeps manual source pages 2 and 5 on every module', () => {
    expect(getWallCabinetCatalog().every((module) => module.sourcePages.join(',') === '2,5')).toBe(
      true,
    );
  });
});
