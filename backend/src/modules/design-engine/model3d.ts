import type { KitchenBaseCabinetDesignResult, PreliminaryCutlistPiece } from './types.js';

export type Design3DBox = {
  id: string;
  label: string;
  moduleName: string | null;
  pieceName: string;
  xMm: number;
  yMm: number;
  zMm: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  thicknessMm: number | null;
  materialName: string | null;
  color: string | null;
  notes: string | null;
};

export type Design3DModel = {
  id: string;
  name: string;
  unit: 'mm';
  boxes: Design3DBox[];
  warnings: string[];
  notes: string[];
};

export type CreateBasic3DModelFromDesignPiecesInput = {
  id?: string;
  name?: string;
  designResult: KitchenBaseCabinetDesignResult;
  materialName?: string | null;
  defaultColor?: string | null;
};

const PRELIMINARY_3D_VALIDATION_NOTE =
  'Vista 3D preliminar generada por Rubik OS. No apta para fabricación sin validación de Diego.';

export function createBasic3DModelFromDesignPieces(
  input: CreateBasic3DModelFromDesignPiecesInput,
): Design3DModel {
  const boxes = input.designResult.pieces.flatMap((piece, pieceIndex) =>
    createBoxesFromPiece({
      color: input.defaultColor ?? null,
      materialName: input.materialName ?? null,
      piece,
      pieceIndex,
    }),
  );

  return {
    id: input.id ?? 'design-3d-model-preliminary',
    name: input.name ?? 'Modelo 3D preliminar Rubik',
    unit: 'mm',
    boxes,
    warnings: input.designResult.warnings.map((warning) => warning.message),
    notes: Array.from(new Set([...input.designResult.notes, PRELIMINARY_3D_VALIDATION_NOTE])),
  };
}

function createBoxesFromPiece(input: {
  color: string | null;
  materialName: string | null;
  piece: PreliminaryCutlistPiece;
  pieceIndex: number;
}): Design3DBox[] {
  return Array.from({ length: input.piece.quantity }, (_, quantityIndex) => {
    const approximatePosition = calculateApproximatePosition(input.pieceIndex, quantityIndex);

    return {
      id: `box-${input.pieceIndex + 1}-${quantityIndex + 1}`,
      label: createBoxLabel(input.piece, quantityIndex),
      moduleName: input.piece.module_name,
      pieceName: input.piece.piece_name,
      xMm: approximatePosition.xMm,
      yMm: approximatePosition.yMm,
      zMm: approximatePosition.zMm,
      widthMm: input.piece.length_mm,
      heightMm: input.piece.thickness_mm ?? 1,
      depthMm: input.piece.width_mm,
      thicknessMm: input.piece.thickness_mm,
      materialName: input.materialName,
      color: input.color,
      notes: input.piece.notes,
    };
  });
}

function calculateApproximatePosition(
  pieceIndex: number,
  quantityIndex: number,
): { xMm: number; yMm: number; zMm: number } {
  return {
    xMm: pieceIndex * 40,
    yMm: quantityIndex * 20,
    zMm: 0,
  };
}

function createBoxLabel(piece: PreliminaryCutlistPiece, quantityIndex: number): string {
  const modulePrefix = piece.module_name === null ? 'General' : piece.module_name;

  return `${modulePrefix} - ${piece.piece_name} #${quantityIndex + 1}`;
}
