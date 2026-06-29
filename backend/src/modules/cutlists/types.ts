export type GrainDirection = 'horizontal' | 'vertical' | 'indistinto';

export type CutlistItem = {
  id: string;
  quoteId: string;
  moduleName: string | null;
  pieceName: string;
  materialId: string | null;
  quantity: number;
  lengthMm: number;
  widthMm: number;
  thicknessMm: number | null;
  edgeFrontMm: number;
  edgeBackMm: number;
  edgeLeftMm: number;
  edgeRightMm: number;
  grainDirection: GrainDirection | null;
  notes: string | null;
  approvedForCut: boolean;
  createdAt: Date;
};
