import type { CutlistItem } from '../cutlists/types.js';
import type { KitchenBaseCabinetDesignResult, PreliminaryCutlistPiece } from './types.js';

export type CutlistItemDraft = Omit<CutlistItem, 'quoteId'> & {
  quoteId: string | null;
};

export type ConvertDesignPiecesToCutlistItemsInput = {
  quoteId?: string | null;
  materialId?: string | null;
  designResult: KitchenBaseCabinetDesignResult;
  approvedForCut?: boolean;
  createdAt?: Date;
  idPrefix?: string;
};

const DEFAULT_CREATED_AT = new Date('1970-01-01T00:00:00.000Z');

export function convertDesignPiecesToCutlistItems(
  input: ConvertDesignPiecesToCutlistItemsInput & { quoteId: string },
): CutlistItem[];
export function convertDesignPiecesToCutlistItems(
  input: ConvertDesignPiecesToCutlistItemsInput,
): CutlistItemDraft[];
export function convertDesignPiecesToCutlistItems(
  input: ConvertDesignPiecesToCutlistItemsInput,
): CutlistItemDraft[] {
  const quoteId = input.quoteId ?? null;
  const materialId = input.materialId ?? null;
  const approvedForCut = input.approvedForCut ?? false;
  const createdAt = input.createdAt ?? DEFAULT_CREATED_AT;
  const idPrefix = input.idPrefix ?? 'design-piece';

  return input.designResult.pieces.map((piece, index) => {
    return {
      id: `${idPrefix}-${index + 1}`,
      quoteId,
      moduleName: piece.module_name,
      pieceName: piece.piece_name,
      materialId,
      quantity: piece.quantity,
      lengthMm: piece.length_mm,
      widthMm: piece.width_mm,
      thicknessMm: piece.thickness_mm,
      edgeFrontMm: piece.edge_front_mm,
      edgeBackMm: piece.edge_back_mm,
      edgeLeftMm: piece.edge_left_mm,
      edgeRightMm: piece.edge_right_mm,
      grainDirection: piece.grain_direction,
      notes: buildCutlistNotes(piece, input.designResult),
      approvedForCut,
      createdAt: new Date(createdAt.getTime()),
    };
  });
}

function buildCutlistNotes(
  piece: PreliminaryCutlistPiece,
  designResult: KitchenBaseCabinetDesignResult,
): string | null {
  const notes = [piece.notes, ...designResult.warnings.map((warning) => warning.message)].filter(
    (note): note is string => typeof note === 'string' && note.trim().length > 0,
  );

  if (notes.length === 0) {
    return null;
  }

  return notes.join(' ');
}
