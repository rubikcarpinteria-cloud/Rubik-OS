import { describe, expect, it } from 'vitest';

import {
  composeModuleInstancesOnWall,
  createModuleInstanceFromTemplate,
  getModuleTemplateByCode,
  getModuleTemplates,
  getModuleTemplatesByCategory,
  updateModuleInstanceWidth,
} from '../src/modules/design-engine/index.js';

describe('standard module templates and smart instances', () => {
  it('exposes a standard module library for modular assembly', () => {
    const templates = getModuleTemplates();

    expect(templates.map((template) => template.name)).toEqual(
      expect.arrayContaining([
        'Bajo mesada con puertas',
        'Bajo mesada cajonera',
        'Bajo mesada bacha',
        'Bajo mesada horno empotrado',
        'Bajo mesada lavavajillas',
        'Bajo mesada organizador angosto',
        'Alacena con puertas',
        'Alacena volcable',
        'Columna despensa',
        'Columna horno/microondas',
        'Módulo esquina',
        'Módulo terminal',
      ]),
    );
  });

  it('defines construction rules for the base cabinet with doors template', () => {
    const template = getModuleTemplateByCode('BASE_DOORS_STANDARD');

    expect(template).toMatchObject({
      defaultHeightMm: 720,
      defaultDepthMm: 620,
      constructionRules: {
        material: 'melamina',
        materialThicknessMm: 18,
        recessedBackPanel: true,
        upperReinforcement: true,
        rearReinforcement: true,
      },
      doorRules: {
        defaultDoors: 2,
        lateralGapMm: 2,
        singleDoorMaxWidthMm: 450,
      },
      shelfRules: {
        defaultShelves: 1,
      },
      edgeBandingRules: {
        visibleEdgeMm: 2,
      },
    });
  });

  it('creates module instances from templates without manual technical data entry', () => {
    const instance = createModuleInstanceFromTemplate({
      templateCode: 'BASE_DOORS_STANDARD',
      position: 1,
      widthMm: 1000,
    });

    expect(instance).toMatchObject({
      name: 'Bajo mesada con puertas',
      widthMm: 1000,
      heightMm: 720,
      depthMm: 620,
      doors: 2,
      shelves: 1,
      requiresDiegoValidation: true,
    });
    expect(instance.accessories).toContain('bisagras');
  });

  it('keeps two doors at 800 mm and automatically changes to one door at 400 mm', () => {
    const standard = createModuleInstanceFromTemplate({
      templateCode: 'BASE_DOORS_STANDARD',
      position: 1,
      widthMm: 800,
    });
    const narrow = updateModuleInstanceWidth(standard, 400);

    expect(standard.doors).toBe(2);
    expect(narrow.doors).toBe(1);
    expect(narrow.autoAdjustments).toContain('Ajuste automático: ancho 400 mm usa 1 puerta.');
  });

  it('composes module instances on an available wall and recalculates remaining space', () => {
    const first = createModuleInstanceFromTemplate({
      templateCode: 'BASE_DOORS_STANDARD',
      position: 1,
      widthMm: 800,
    });
    const second = createModuleInstanceFromTemplate({
      templateCode: 'BASE_DRAWERS_STANDARD',
      position: 2,
      widthMm: 560,
    });

    const composition = composeModuleInstancesOnWall({
      availableWidthMm: 1800,
      instances: [first, second],
      toleranceMm: 0,
    });

    expect(composition.usedWidthMm).toBe(1360);
    expect(composition.remainingWidthMm).toBe(440);
    expect(composition.overflowWidthMm).toBe(0);
    expect(composition.fits).toBe(true);
    expect(composition.warnings).toContain(
      'Quedan 440 mm libres para relleno, ajuste o nuevo módulo.',
    );
  });

  it('filters templates by category for future UI libraries', () => {
    const baseTemplates = getModuleTemplatesByCategory('base');

    expect(baseTemplates.length).toBeGreaterThan(0);
    expect(baseTemplates.every((template) => template.category === 'base')).toBe(true);
  });
});
