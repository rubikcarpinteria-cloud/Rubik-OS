# Diego Approval Flow

Diego es el responsable tecnico y decisor final de Rubik. Rubik OS debe reducirle trabajo, no sumarle carga: su tarea es presentar informacion clara, resumida y accionable para que Diego pueda aprobar, modificar, rechazar o pedir mas datos.

Nada critico debe enviarse o confirmarse sin Diego. La IA puede preparar, sugerir, calcular y advertir, pero las decisiones tecnicas y comerciales finales permanecen en Diego.

## Diego debe aprobar

- Presupuesto tentativo antes de enviarlo.
- Precio final.
- Diseno tecnico final.
- Fecha tentativa antes de confirmarla.
- Avance a produccion o corte.
- Resolucion de bloqueos importantes.
- Reactivacion de obras pausadas si afecta agenda o capacidad.

## Decisiones posibles

- Aprobar: permite avanzar al siguiente estado autorizado.
- Modificar: Diego ajusta precio, alcance, diseno, materiales o fecha.
- Rechazar: la orden no avanza y queda registrada la razon.
- Pedir mas datos: vuelve a relevamiento o queda esperando informacion.
- Guardar borrador: conserva una propuesta sin enviarla.
- Enviar al cliente: habilitado solo cuando la informacion necesaria esta aprobada.
- Pausar: congela el avance por falta de condiciones.
- Reactivar con revision: vuelve a planeamiento antes de prometer fechas.

## Pantalla ideal para Diego

La pantalla de revision debe mostrar:

- Cliente.
- Canal.
- Pedido resumido.
- Fotos.
- Medidas.
- Faltantes.
- Riesgos tecnicos.
- Mini propuesta visual o tecnica.
- Presupuesto tentativo.
- Materiales sugeridos.
- Proveedores pendientes.
- Disponibilidad operativa.
- Fecha tentativa.
- Conflictos detectados.
- Historial de conversacion.
- Botones de decision.

## Botones

- `aprobar`
- `modificar`
- `rechazar`
- `pedir_mas_datos`
- `guardar_borrador`
- `enviar_al_cliente`
- `pausar`
- `reactivar_con_revision`

## Regla de carga operativa

Rubik OS debe evitar que Diego tenga que leer conversaciones completas para entender cada caso. El sistema debe mostrarle el resumen, los faltantes, los riesgos y la decision que se necesita, con acceso al historial completo solo cuando haga falta.
