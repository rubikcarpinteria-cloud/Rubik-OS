import { describe, expect, it } from 'vitest';

import type { KitchenBaseCabinetInput } from '../src/modules/design-engine/index.js';
import { generateKitchenBaseCabinetCutlist } from '../src/modules/design-engine/index.js';

const standardBaseCabinet: KitchenBaseCabinetInput = {
  widthMm: 1800,
  heightMm: 720,
  depthMm: 620,
  materialThicknessMm: 18,
  backPanelThicknessMm: 3,
  hasBackPanel: true,
  hasToeKick: true,
  toeKickHeightMm: 100,
  modules: [
    {
      name: 'puertas izquierdas',
      widthMm: 900,
      type: 'doors',
      doors: 2,
      shelves: 1,
    },
    {
      name: 'cajonera derecha',
      widthMm: 900,
      type: 'drawers',
      drawers: 3,
    },
  ],
};

describe('design engine kitchen base cabinet v0', () => {
  it('generates the preliminary cutlist for a 1800 mm two-module base cabinet', () => {
    const result = generateKitchenBaseCabinetCutlist(standardBaseCabinet);

    expect(result.warnings).toEqual([]);
    expect(result.pieces).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          piece_name: 'Laterales',
          quantity: 2,
          length_mm: 720,
          width_mm: 620,
          thickness_mm: 18,
        }),
        expect.objectContaining({
          piece_name: 'Base',
          quantity: 1,
          length_mm: 1764,
          width_mm: 620,
        }),
        expect.objectContaining({
          piece_name: 'Travesaños superiores',
          quantity: 2,
          length_mm: 1764,
          width_mm: 100,
        }),
        expect.objectContaining({
          piece_name: 'Divisiones internas',
          quantity: 1,
          length_mm: 720,
          width_mm: 620,
        }),
        expect.objectContaining({
          module_name: 'puertas izquierdas',
          piece_name: 'Estantes',
          quantity: 1,
          length_mm: 864,
          width_mm: 570,
        }),
        expect.objectContaining({
          module_name: 'puertas izquierdas',
          piece_name: 'Puertas',
          quantity: 2,
          length_mm: 716,
          width_mm: 447,
        }),
        expect.objectContaining({
          module_name: 'cajonera derecha',
          piece_name: 'Frentes de cajón',
          quantity: 3,
          length_mm: 238,
          width_mm: 896,
        }),
        expect.objectContaining({
          piece_name: 'Fondo',
          quantity: 1,
          length_mm: 1800,
          width_mm: 720,
          thickness_mm: 3,
        }),
        expect.objectContaining({
          piece_name: 'Frente de zócalo',
          quantity: 1,
          length_mm: 1800,
          width_mm: 100,
        }),
      ]),
    );
  });

  it('returns a warning when module widths do not match the total width', () => {
    const result = generateKitchenBaseCabinetCutlist({
      ...standardBaseCabinet,
      modules: [
        {
          name: 'puertas izquierdas',
          widthMm: 800,
          type: 'doors',
          doors: 2,
          shelves: 1,
        },
        {
          name: 'cajonera derecha',
          widthMm: 900,
          type: 'drawers',
          drawers: 3,
        },
      ],
    });

    expect(result.warnings).toEqual([
      {
        code: 'MODULE_WIDTH_MISMATCH',
        message: 'La suma de módulos (1700 mm) no coincide con el ancho total (1800 mm).',
      },
    ]);
  });

  it('fails in a controlled way when a measure is invalid or negative', () => {
    expect(() =>
      generateKitchenBaseCabinetCutlist({
        ...standardBaseCabinet,
        depthMm: -620,
      }),
    ).toThrow(RangeError);
  });

  it('adds 2 mm edge banding on all four sides for doors and drawer fronts', () => {
    const result = generateKitchenBaseCabinetCutlist(standardBaseCabinet);
    const doors = result.pieces.find((piece) => piece.piece_name === 'Puertas');
    const drawerFronts = result.pieces.find((piece) => piece.piece_name === 'Frentes de cajón');

    expect(doors).toMatchObject({
      edge_front_mm: 2,
      edge_back_mm: 2,
      edge_left_mm: 2,
      edge_right_mm: 2,
    });
    expect(drawerFronts).toMatchObject({
      edge_front_mm: 2,
      edge_back_mm: 2,
      edge_left_mm: 2,
      edge_right_mm: 2,
    });
  });

  it('includes a clear Diego validation note', () => {
    const result = generateKitchenBaseCabinetCutlist(standardBaseCabinet);

    expect(result.notes).toContain(
      'Despiece preliminar generado por Rubik OS. Requiere validación de Diego antes de enviar a corte.',
    );
    expect(result.pieces.every((piece) => piece.notes?.includes('validación de Diego'))).toBe(true);
  });
});
