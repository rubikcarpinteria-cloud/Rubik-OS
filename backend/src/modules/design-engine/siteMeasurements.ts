export type MeasurementSource = 'whatsapp_photo' | 'whatsapp_text' | 'manual_form' | 'onsite_note';

export type MeasuredBy = 'diego' | 'joel' | 'karem' | 'other';

export type SiteMeasurementStatus =
  | 'intake_recibido'
  | 'medidas_interpretadas'
  | 'diseño_preliminar'
  | 'cotizacion_preliminar'
  | 'pendiente_validacion_diego'
  | 'validado_para_cliente'
  | 'aprobado_para_corte'
  | 'enviado_a_maderera'
  | 'rechazado_o_requiere_correccion';

export type SiteMeasurement = {
  id: string;
  source: MeasurementSource;
  measuredBy: MeasuredBy;
  createdAt: Date;
  roomType: string;
  status: SiteMeasurementStatus;
  notes: string | null;
  photoRefs: string[];
  rawAnnotations: string[];
  requiresOnsiteValidation: boolean;
  requiresDiegoValidation: boolean;
};

export type CreateSiteMeasurementInput = {
  id: string;
  source: MeasurementSource;
  measuredBy: MeasuredBy;
  createdAt: Date;
  roomType: string;
  status?: SiteMeasurementStatus;
  notes?: string | null;
  photoRefs?: readonly string[];
  rawAnnotations?: readonly string[];
};

export type KitchenUnderCounterMeasurement = {
  totalMainRunWidthMm: number | null;
  leftReturnWidthMm: number | null;
  rightReturnWidthMm: number | null;
  countertopAlreadyInstalled: boolean;
  countertopDepthMm: number | null;
  availableHeightMm: number | null;
  windowPresent: boolean;
  electricalOutletsPresent: boolean;
  waterGasOrDrainToCheck: boolean;
  rawAnnotations: string[];
};

export type KitchenUnderCounterMeasurementValidation = {
  isValidForPreliminaryDesign: boolean;
  warnings: string[];
  missingFields: string[];
};

export function createSiteMeasurement(input: CreateSiteMeasurementInput): SiteMeasurement {
  return {
    id: input.id,
    source: input.source,
    measuredBy: input.measuredBy,
    createdAt: input.createdAt,
    roomType: input.roomType,
    status: input.status ?? 'intake_recibido',
    notes: input.notes ?? null,
    photoRefs: [...(input.photoRefs ?? [])],
    rawAnnotations: [...(input.rawAnnotations ?? [])],
    requiresOnsiteValidation: requiresOnsiteValidation(input.source),
    requiresDiegoValidation: true,
  };
}

export function validateKitchenUnderCounterMeasurement(
  input: Partial<KitchenUnderCounterMeasurement>,
): KitchenUnderCounterMeasurementValidation {
  const warnings: string[] = [];
  const missingFields: string[] = [];

  addRequiredMeasureValidation({
    fieldName: 'totalMainRunWidthMm',
    label: 'ancho total del recorrido principal',
    missingFields,
    value: input.totalMainRunWidthMm,
    warnings,
  });
  addRequiredMeasureValidation({
    fieldName: 'countertopDepthMm',
    label: 'profundidad real',
    missingFields,
    value: input.countertopDepthMm,
    warnings,
  });
  addRequiredMeasureValidation({
    fieldName: 'availableHeightMm',
    label: 'altura disponible',
    missingFields,
    value: input.availableHeightMm,
    warnings,
  });

  if (input.countertopAlreadyInstalled === true) {
    warnings.push('La mesada ya está instalada: el mueble debe adaptarse a la mesada existente.');
  }

  if (input.waterGasOrDrainToCheck === true) {
    warnings.push('Se deben validar conexiones de agua, gas o desagüe antes de fabricar.');
  }

  return {
    isValidForPreliminaryDesign: missingFields.length === 0,
    warnings,
    missingFields,
  };
}

function requiresOnsiteValidation(source: MeasurementSource): boolean {
  return source === 'whatsapp_photo' || source === 'whatsapp_text';
}

function addRequiredMeasureValidation(input: {
  fieldName: keyof KitchenUnderCounterMeasurement;
  label: string;
  missingFields: string[];
  value: number | null | undefined;
  warnings: string[];
}): void {
  if (typeof input.value !== 'number' || !Number.isFinite(input.value) || input.value <= 0) {
    input.missingFields.push(input.fieldName);
    input.warnings.push(`Falta ${input.label} para avanzar con diseño preliminar confiable.`);
  }
}
