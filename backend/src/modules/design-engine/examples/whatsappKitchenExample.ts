import { createSiteMeasurement, type KitchenUnderCounterMeasurement } from '../siteMeasurements.js';

export const whatsappKitchenSiteMeasurement = createSiteMeasurement({
  id: 'site-measurement-whatsapp-kitchen-001',
  source: 'whatsapp_photo',
  measuredBy: 'diego',
  createdAt: new Date('2026-06-29T12:00:00.000Z'),
  roomType: 'kitchen',
  photoRefs: ['whatsapp-photo-kitchen-001'],
  rawAnnotations: [
    '80 cm sector izquierdo',
    '56 cm sector central',
    '110 cm sector bajo mesada',
    '71 cm sector lateral derecho',
    '307 cm recorrido principal',
    '65 cm profundidad aproximada',
    '75 cm altura disponible aproximada',
  ],
  notes:
    'Medidas tomadas de foto/anotación. Requiere validación en obra. No apto para corte sin aprobación de Diego.',
});

export const whatsappKitchenUnderCounterMeasurement: KitchenUnderCounterMeasurement = {
  totalMainRunWidthMm: 3070,
  leftReturnWidthMm: null,
  rightReturnWidthMm: null,
  countertopAlreadyInstalled: true,
  countertopDepthMm: 650,
  availableHeightMm: 750,
  windowPresent: true,
  electricalOutletsPresent: true,
  waterGasOrDrainToCheck: true,
  rawAnnotations: [
    '80 cm sector izquierdo',
    '56 cm sector central',
    '110 cm sector bajo mesada',
    '71 cm sector lateral derecho',
    '307 cm recorrido principal',
    '65 cm profundidad aproximada',
    '75 cm altura disponible aproximada',
  ],
};
