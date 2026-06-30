# Planning And Follow Up

La IA de planeamiento y coordinacion es el modulo que controla pendientes, confirmaciones, bloqueos y viabilidad operativa. Su funcion es evitar que Rubik prometa fechas o avance a etapas criticas sin tener luz verde de las partes necesarias.

Una agenda muestra fechas. Rubik OS debe decir si una fecha es viable.

## Responsabilidades

- Detectar informacion faltante.
- Controlar confirmaciones criticas.
- Diferenciar fecha tentativa de fecha confirmada.
- Verificar que Diego aprobo lo necesario.
- Verificar que cliente, proveedor, maderera, instalador y equipo dieron OK cuando corresponda.
- Avisar conflictos con otras obras activas.
- Bloquear avances criticos si falta una condicion necesaria.
- Registrar alertas y razones de bloqueo.

## Confirmaciones necesarias posibles

- Diego aprobo diseno.
- Diego aprobo precio.
- Diego aprobo fecha.
- Cliente acepto presupuesto.
- Cliente pago sena.
- Cliente envio medidas o fotos suficientes.
- Maderera confirmo disponibilidad.
- Maderera confirmo precio.
- Maderera confirmo demora de corte.
- Instalador confirmo disponibilidad.
- Equipo interno confirmo capacidad.
- Obra confirmo que el espacio esta listo.
- Proveedor entrego material externo.

## Alertas

| Alerta | Significado |
| --- | --- |
| `falta_confirmacion_diego` | Diego todavia no aprobo una decision critica. |
| `falta_respuesta_cliente` | El cliente no respondio una consulta necesaria. |
| `falta_sena` | No se registro la sena requerida. |
| `falta_medidas` | Faltan medidas suficientes para cotizar o producir. |
| `falta_confirmacion_maderera` | La maderera no confirmo precio, stock o demora. |
| `falta_confirmacion_instalador` | El instalador no confirmo disponibilidad. |
| `conflicto_agenda` | La fecha cruza con otro trabajo o excede capacidad. |
| `obra_no_lista` | La obra o espacio todavia no esta en condiciones. |
| `dependencia_bloqueante` | Hay una condicion externa o interna que impide avanzar. |
| `fecha_tentativa_no_confirmada` | Existe una fecha posible, pero aun no debe prometerse. |

## Fecha tentativa vs fecha confirmada

Una fecha tentativa es una posibilidad interna sujeta a confirmaciones. No debe comunicarse como compromiso final si falta aprobacion de Diego, sena, disponibilidad de materiales, capacidad operativa o confirmacion de obra lista.

Una fecha confirmada requiere que las condiciones criticas esten resueltas y que Diego haya autorizado comunicarla.

## Regla central

Si falta una confirmacion critica, la orden no puede pasar al siguiente estado critico. Rubik OS debe mostrar que falta, quien debe resolverlo y que decision esta bloqueada.
