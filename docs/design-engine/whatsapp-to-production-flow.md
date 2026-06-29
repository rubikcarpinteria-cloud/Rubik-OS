# Flujo oficial — WhatsApp a diseño, despiece, cotización y producción

## 1. Objetivo

Rubik OS debe convertir fotos, medidas y notas enviadas por Diego o Joel en una propuesta técnica preliminar de mueble. Esa propuesta puede incluir interpretación de medidas, armado por módulos internos, modelo 3D preliminar, despiece, lista de corte, cálculo de cantos, placas, herrajes y cotización.

El flujo no reemplaza la validación humana. Las medidas enviadas por WhatsApp son una entrada de trabajo y deben mantenerse trazables hasta que Diego valide el diseño, la cotización o el corte.

## 2. Flujo troncal

```text
WhatsApp: foto + medidas
→ interpretación
→ módulos internos
→ modelo 3D preliminar
→ despiece
→ cutlist
→ cotización
→ validación Diego
→ salida cliente o maderera
```

## 3. Reglas críticas

- WhatsApp no es fuente final de fabricación.
- Las medidas deben quedar trazables.
- Todo cálculo es preliminar.
- Diego valida antes de presupuesto final.
- Diego valida antes de corte.
- Cliente y maderera reciben salidas distintas.
- Nada se manda automáticamente.

## 4. Diferencia entre salida a cliente y salida a maderera

### Salida a cliente

- render/vista preliminar
- resumen de diseño
- presupuesto preliminar/final según validación
- condiciones de seña y validez

### Salida a maderera

- lista de corte validada
- material
- espesor
- cantos
- observaciones técnicas
- solo después de aprobación de Diego

## 5. Estados sugeridos

- `intake_recibido`
- `medidas_interpretadas`
- `diseño_preliminar`
- `cotizacion_preliminar`
- `pendiente_validacion_diego`
- `validado_para_cliente`
- `aprobado_para_corte`
- `enviado_a_maderera`
- `rechazado_o_requiere_correccion`

## 6. Riesgos

- medidas incorrectas desde foto
- perspectiva engañosa
- falta de datos de obra
- conexiones no verificadas
- diferencia entre mesada existente y mueble propuesto
- errores de módulo si la suma no coincide con el ancho total

## 7. Validaciones obligatorias

- suma de módulos internos contra ancho total
- altura disponible
- profundidad real
- interferencias
- conexiones
- escuadra/plomo
- material y canto
- aprobación Diego
