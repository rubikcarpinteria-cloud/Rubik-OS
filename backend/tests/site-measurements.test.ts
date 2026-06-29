import { describe, expect, it } from 'vitest';

import {
  createSiteMeasurement,
  validateKitchenUnderCounterMeasurement,
  type KitchenUnderCounterMeasurement,
} from '../src/modules/design-engine/index.js';
import {
  whatsappKitchenSiteMeasurement,
  whatsappKitchenUnderCounterMeasurement,
} from '../src/modules/design-engine/examples/whatsappKitchenExample.js';

describe('site measurements intake', () => {
  it('creates a WhatsApp measurement with traceability', () => {
    const measurement = createSiteMeasurement({
      id: 'measurement-whatsapp-001',
      source: 'whatsapp_photo',
      measuredBy: 'joel',
      createdAt: new Date('2026-06-29T15:00:00.000Z'),
      roomType: 'kitchen',
      photoRefs: ['wa-photo-001'],
      rawAnnotations: ['307 cm recorrido principal'],
      notes: 'Foto enviada por WhatsApp con medidas anotadas.',
    });

    expect(measurement).toMatchObject({
      id: 'measurement-whatsapp-001',
      source: 'whatsapp_photo',
      measuredBy: 'joel',
      roomType: 'kitchen',
      status: 'intake_recibido',
      photoRefs: ['wa-photo-001'],
      rawAnnotations: ['307 cm recorrido principal'],
    });
    expect(measurement.createdAt).toEqual(new Date('2026-06-29T15:00:00.000Z'));
  });

  it('marks WhatsApp measurements as requiring onsite validation', () => {
    expect(whatsappKitchenSiteMeasurement.requiresOnsiteValidation).toBe(true);
  });

  it('always marks measurements as requiring Diego validation', () => {
    expect(whatsappKitchenSiteMeasurement.requiresDiegoValidation).toBe(true);
  });

  it('validates a kitchen under-counter measurement with installed countertop', () => {
    const validation = validateKitchenUnderCounterMeasurement(
      whatsappKitchenUnderCounterMeasurement,
    );

    expect(validation.isValidForPreliminaryDesign).toBe(true);
    expect(validation.missingFields).toEqual([]);
    expect(validation.warnings).toContain(
      'La mesada ya está instalada: el mueble debe adaptarse a la mesada existente.',
    );
  });

  it('generates warnings when connections must be checked', () => {
    const validation = validateKitchenUnderCounterMeasurement(
      whatsappKitchenUnderCounterMeasurement,
    );

    expect(validation.warnings).toContain(
      'Se deben validar conexiones de agua, gas o desagüe antes de fabricar.',
    );
  });

  it('detects missing fields required for preliminary design', () => {
    const incompleteMeasurement: Partial<KitchenUnderCounterMeasurement> = {
      countertopAlreadyInstalled: false,
      waterGasOrDrainToCheck: false,
    };

    const validation = validateKitchenUnderCounterMeasurement(incompleteMeasurement);

    expect(validation.isValidForPreliminaryDesign).toBe(false);
    expect(validation.missingFields).toEqual([
      'totalMainRunWidthMm',
      'countertopDepthMm',
      'availableHeightMm',
    ]);
    expect(validation.warnings).toEqual(
      expect.arrayContaining([
        'Falta ancho total del recorrido principal para avanzar con diseño preliminar confiable.',
        'Falta profundidad real para avanzar con diseño preliminar confiable.',
        'Falta altura disponible para avanzar con diseño preliminar confiable.',
      ]),
    );
  });

  it('does not automatically approve supplier output', () => {
    expect(whatsappKitchenSiteMeasurement.status).not.toBe('aprobado_para_corte');
    expect(whatsappKitchenSiteMeasurement.status).not.toBe('enviado_a_maderera');
    expect(whatsappKitchenSiteMeasurement.requiresDiegoValidation).toBe(true);
  });
});
