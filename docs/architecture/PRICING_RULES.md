# Pricing Rules

Rubik OS debe distinguir entre presupuesto tentativo y presupuesto final. El presupuesto tentativo orienta al cliente despues de una revision de Diego. El presupuesto final requiere desglose tecnico, materiales, mano de obra, condiciones de pago, vigencia y aprobacion final.

La regla principal es que el presupuesto debe ser sostenible para el cliente, pero Rubik no puede quedar desprotegido ante variacion de dolar, inflacion o suba de materiales.

## Revision de Diego

Ningun presupuesto definitivo debe enviarse sin Diego. Rubik OS puede preparar calculos, comparar costos, sugerir margen y marcar riesgos, pero Diego debe aprobar antes de enviar.

## Moneda y referencia

- Moneda principal: ARS.
- Opcion de referencia: USD.
- Para USD se puede usar el tipo de cambio dolar blue del dia como referencia.
- La referencia de cambio debe quedar registrada en el presupuesto.

## Componentes de precio

- Placas.
- Cantos.
- Herrajes.
- Mano de obra.
- Instalacion.
- Flete.
- Margen.
- Tercerizados si corresponde.
- Variacion por urgencia o complejidad.
- Ajustes por proveedor, demora o disponibilidad.

## Vigencia y congelamiento

Todo presupuesto debe tener validez definida. Si el cliente acepta fuera de vigencia, Rubik OS debe marcar `requiere_actualizacion`. Si se toma sena, debe quedar registrada la fecha de congelamiento de precio y que condiciones quedan cubiertas.

La actualizacion puede depender de inflacion, dolar, suba de placas, herrajes, flete o costos tercerizados.

## Campos sugeridos

- `quote_status`
- `quote_valid_until`
- `currency`
- `exchange_rate_reference`
- `deposit_required`
- `price_freeze_date`
- `update_rule`
- `diego_approval_required`

## Estados de presupuesto

| Estado | Descripcion |
| --- | --- |
| `borrador` | Calculo interno no listo para enviar. |
| `tentativo` | Estimacion preliminar, sujeta a revision y datos finales. |
| `esperando_revision_diego` | Diego debe revisar antes de enviar. |
| `aprobado_por_diego` | Diego autorizo el presupuesto. |
| `enviado_cliente` | Se envio al cliente. |
| `aceptado_cliente` | El cliente acepto o dio OK comercial. |
| `rechazado_cliente` | El cliente rechazo. |
| `vencido` | Paso la fecha de validez. |
| `requiere_actualizacion` | Debe recalcularse por tiempo, dolar, inflacion o materiales. |
| `confirmado` | Quedo confirmado bajo condiciones aprobadas. |

## Reglas de negocio

- Presupuesto tentativo no equivale a precio final.
- Fecha de instalacion no debe confirmarse solo porque el presupuesto fue aceptado.
- Sena registrada puede congelar condiciones solo si la regla lo indica.
- Cambios de alcance requieren nueva revision.
- Costos tercerizados deben registrarse con proveedor, fecha y validez.
- Diego debe aprobar precio final y excepciones comerciales.
