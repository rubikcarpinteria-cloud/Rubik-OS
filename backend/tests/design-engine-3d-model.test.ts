import { describe, expect, it } from 'vitest';

import {
  createBasic3DModelFromDesignPieces,
  generateKitchenBaseCabinetCutlist,
  type KitchenBaseCabinetInput,
} from '../src/modules/design-engine/index.js';

const kitchenBaseCabinetInput: KitchenBaseCabinetInput = {
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

function createDesignResult() {
  return generateKitchenBaseCabinetCutlist(kitchenBaseCabinetInput);
}

describe('design engine 3D model descriptor', () => {
  it('generates a Design3DModel with boxes from kitchen base cabinet pieces', () => {
    const designResult = createDesignResult();
    const model = createBasic3DModelFromDesignPieces({
      designResult,
      id: 'model-bajo-mesada-demo',
      name: 'Bajo mesada demo 3D',
      materialName: 'Melamina Faplac básica 18 mm',
      defaultColor: '#d6b98c',
    });

    const expectedBoxes = designResult.pieces.reduce((total, piece) => total + piece.quantity, 0);

    expect(model).toMatchObject({
      id: 'model-bajo-mesada-demo',
      name: 'Bajo mesada demo 3D',
      unit: 'mm',
      warnings: [],
    });
    expect(model.boxes).toHaveLength(expectedBoxes);
    expect(model.boxes[0]).toMatchObject({
      label: 'General - Laterales #1',
      pieceName: 'Laterales',
      materialName: 'Melamina Faplac básica 18 mm',
      color: '#d6b98c',
    });
  });

  it('creates boxes with positive dimensions', () => {
    const model = createBasic3DModelFromDesignPieces({ designResult: createDesignResult() });

    expect(model.boxes.length).toBeGreaterThan(0);
    expect(model.boxes.every((box) => box.widthMm > 0 && box.heightMm > 0 && box.depthMm > 0)).toBe(
      true,
    );
  });

  it('preserves warnings and design notes', () => {
    const designResult = generateKitchenBaseCabinetCutlist({
      ...kitchenBaseCabinetInput,
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
    const model = createBasic3DModelFromDesignPieces({ designResult });

    expect(model.warnings).toContain(
      'La suma de módulos (1700 mm) no coincide con el ancho total (1800 mm).',
    );
    expect(model.notes).toEqual(expect.arrayContaining(designResult.notes));
  });

  it('includes Diego validation note', () => {
    const model = createBasic3DModelFromDesignPieces({ designResult: createDesignResult() });

    expect(model.notes.some((note) => note.includes('validación de Diego'))).toBe(true);
  });

  it('does not require external dependencies or real rendering', () => {
    const model = createBasic3DModelFromDesignPieces({ designResult: createDesignResult() });

    expect(model.boxes.every((box) => typeof box.xMm === 'number')).toBe(true);
    expect(model.boxes.every((box) => typeof box.yMm === 'number')).toBe(true);
    expect(model.boxes.every((box) => typeof box.zMm === 'number')).toBe(true);
    expect(model).not.toHaveProperty('renderer');
    expect(model).not.toHaveProperty('scene');
  });
});
