export type DemoCurrency = 'ARS' | 'USD';

export type DesignEngineDemoForm = {
  widthMm: number;
  heightMm: number;
  depthMm: number;
  materialThicknessMm: number;
  backPanelThicknessMm: number;
  hasBackPanel: boolean;
  hasToeKick: boolean;
  toeKickHeightMm: number;
  doorModuleWidthMm: number;
  doorCount: number;
  shelfCount: number;
  drawerModuleWidthMm: number;
  drawerCount: number;
  boardPriceArs: number;
  boardWidthMm: number;
  boardLengthMm: number;
  edgeBandPriceArsPerMeter: number;
  hardwareSubtotalArs: number;
  servicesSubtotalArs: number;
  laborSubtotalArs: number;
  wastePercentage: number;
  marginPercentage: number;
  depositPercentage: number;
  currency: DemoCurrency;
  exchangeRateSell: number;
};

export type DemoPiece = {
  moduleName: string | null;
  pieceName: string;
  quantity: number;
  lengthMm: number;
  widthMm: number;
  thicknessMm: number | null;
  edgeFrontMm: number;
  edgeBackMm: number;
  edgeLeftMm: number;
  edgeRightMm: number;
  grainDirection: 'horizontal' | 'vertical' | 'indistinto' | null;
  notes: string;
};

export type DemoCutlistItem = DemoPiece & {
  quoteId: null;
  materialId: string | null;
  approvedForCut: false;
};

export type DemoTotals = {
  subtotalBeforeWaste: number;
  wasteAmount: number;
  subtotalWithWaste: number;
  marginAmount: number;
  totalArs: number;
  totalUsd: number | null;
  depositArs: number;
  depositUsd: number | null;
};

export type DesignEngineDemoResult = {
  pieces: DemoPiece[];
  cutlistItems: DemoCutlistItem[];
  warnings: string[];
  errors: string[];
  materialSurfaceM2: number;
  estimatedBoards: number;
  edgeBandLinearMeters: number;
  materialCostArs: number;
  edgeBandCostArs: number;
  totals: DemoTotals;
  notes: string[];
};
