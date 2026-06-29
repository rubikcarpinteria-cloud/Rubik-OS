export type KitchenBaseCabinetModuleType = 'doors' | 'drawers';

export type KitchenBaseCabinetModuleInput = {
  name: string;
  widthMm: number;
  type: KitchenBaseCabinetModuleType;
  doors?: number;
  shelves?: number;
  drawers?: number;
};

export type KitchenBaseCabinetInput = {
  widthMm: number;
  heightMm: number;
  depthMm: number;
  materialThicknessMm: number;
  backPanelThicknessMm: number;
  hasBackPanel: boolean;
  hasToeKick: boolean;
  toeKickHeightMm: number;
  modules: readonly KitchenBaseCabinetModuleInput[];
};

export type PreliminaryCutlistPiece = {
  module_name: string | null;
  piece_name: string;
  quantity: number;
  length_mm: number;
  width_mm: number;
  thickness_mm: number | null;
  edge_front_mm: number;
  edge_back_mm: number;
  edge_left_mm: number;
  edge_right_mm: number;
  grain_direction: 'horizontal' | 'vertical' | 'indistinto' | null;
  notes: string | null;
};

export type DesignEngineWarning = {
  code: 'MODULE_WIDTH_MISMATCH';
  message: string;
};

export type KitchenBaseCabinetDesignResult = {
  pieces: PreliminaryCutlistPiece[];
  warnings: DesignEngineWarning[];
  notes: string[];
};
