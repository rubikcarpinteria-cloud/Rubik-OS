# Project Dependencies And Blockers

Una dependencia es una condicion necesaria para avanzar. Un bloqueo es una dependencia abierta que impide pasar a una etapa critica o confirmar un compromiso.

Rubik OS debe distinguir entre pendientes internos, pendientes externos y conflictos de agenda para evitar promesas imposibles.

## Tipos de pendientes

- Pendiente interno: depende de Rubik, Diego, Joel, instalador oficial, diseno, presupuesto, corte o montaje.
- Pendiente externo: depende del cliente, obra, constructora, proveedor, maderera o tercero.
- Conflicto de agenda: existe una fecha deseada, pero la capacidad real del equipo o los cruces con otras obras la vuelven inviable.

## Tipos de bloqueos

- Cliente.
- Obra o constructora.
- Proveedor o maderera.
- Materiales.
- Agenda.
- Equipo.
- Diseno.
- Presupuesto.
- Pago o sena.
- Aprobacion Diego.
- Tercero o instalador externo.

## Obras pausadas

Una obra pausada no debe quedar como si estuviera lista para instalar en cualquier momento. Rubik OS debe registrar la causa de pausa, la fecha, los pendientes abiertos y las condiciones para reactivar.

## Reactivaciones

Una obra pausada por causas externas no conserva prioridad operativa automatica. Al reactivarse debe volver a revision de planeamiento para revisar:

- Pendientes del cliente o constructora.
- Materiales y entregas externas.
- Agenda actual.
- Capacidad de Diego, Joel, instalador o terceros.
- Cruces con otras obras activas.
- Aprobacion de Diego.

## Obras cruzadas y saturacion

Si una obra reactivada compite con proyectos que Rubik tomo durante la pausa, Rubik OS debe detectar el cruce y advertirlo. La prioridad operativa debe decidirse con informacion real, no por presion de urgencia.

## Caso real obligatorio

Una obra contrato a Rubik hace un mes, pero las puertas y muebles necesarios no llegaban. Durante ese mes no se pudo avanzar con esa obra y Rubik tomo o recibio otras obras. Cuando finalmente llegaron las puertas, la obra original quiso avanzar todo de golpe, pero todavia tenia pendientes propios que debia resolver antes de que Rubik pudiera instalar. Esto genero cruce con otros proyectos activos.

Rubik OS debe detectar este escenario asi:

- Marcar la obra como pausada por dependencia externa.
- Registrar que la llegada de puertas no equivale a obra lista.
- Verificar si quedan pendientes del cliente, constructora o proveedor.
- Revisar agenda y capacidad actual.
- Comparar con otras obras activas.
- Marcar `reactivacion_pendiente` o `reactivado_en_revision`.
- Pedir aprobacion de Diego si la reactivacion afecta agenda o capacidad.
- Evitar confirmar instalacion hasta resolver dependencias abiertas.

## Reglas

- Una obra pausada por causas externas no conserva prioridad automatica.
- Al reactivarse debe volver a revision de planeamiento.
- No se confirma instalacion si hay dependencias abiertas.
- Fecha tentativa no es fecha confirmada.
- Llegada parcial de materiales no equivale a obra lista.
- Diego debe aprobar la reactivacion si afecta agenda o capacidad.
- Rubik OS debe avisar cruces entre proyectos.
- "Llegaron las puertas" no significa "instalacion inmediata".
