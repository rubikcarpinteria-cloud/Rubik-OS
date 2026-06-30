# Work Order Flow

Una orden de trabajo es la unidad operativa central de Rubik OS. Representa un pedido real o potencial de un cliente y concentra todo lo necesario para decidir, presupuestar, disenar, planificar, producir, instalar y hacer postventa.

Todo gira alrededor de la orden porque Rubik necesita saber que trabajo existe, quien lo pidio, en que estado esta, que falta, quien debe aprobar, que archivos lo explican y cual es el proximo paso.

## Nacimiento de una orden

Una orden puede nacer desde una conversacion de WhatsApp, Instagram, TikTok o mail. La IA de ventas interpreta el pedido, crea o actualiza el cliente y registra la informacion disponible, aunque todavia falten datos.

## Datos que contiene

- Cliente y datos de contacto.
- Canal de origen.
- Historial de mensajes.
- Tipo de mueble y ambiente.
- Medidas aproximadas o finales.
- Fotos, videos, planos y referencias.
- Presupuesto tentativo y final.
- Diseno tecnico y versiones.
- Materiales, herrajes, cantos y placas.
- Tareas operativas.
- Proveedores consultados.
- Bloqueos y dependencias.
- Aprobaciones de Diego.
- Fechas tentativas y confirmadas.
- Sena y estado de pago.
- Eventos de produccion, instalacion y postventa.

## Actualizacion de la orden

La orden se actualiza cada vez que entra informacion nueva, se genera una propuesta, Diego toma una decision, el cliente responde, el proveedor confirma, aparece un bloqueo o cambia la agenda. El historial debe conservar que paso, cuando, quien lo hizo y por que.

## Estados principales

| Estado | Descripcion |
| --- | --- |
| `nuevo_contacto` | Llego una consulta inicial todavia sin relevamiento suficiente. |
| `relevamiento_ia` | La IA conversa con el cliente y recopila datos. |
| `esperando_datos_cliente` | Faltan fotos, medidas, ubicacion u otra informacion critica. |
| `orden_creada` | Existe la orden con cliente, canal y pedido base. |
| `mini_propuesta_generada` | Rubik OS preparo resumen, faltantes y propuesta preliminar. |
| `esperando_revision_diego` | Diego debe revisar antes de avanzar. |
| `requiere_modificacion` | Diego o el cliente pidio cambios. |
| `presupuesto_tentativo_aprobado` | Diego aprobo enviar una estimacion preliminar. |
| `presupuesto_enviado_cliente` | El cliente recibio una propuesta tentativa. |
| `esperando_respuesta_cliente` | Se espera respuesta del cliente. |
| `cliente_pide_cambios` | El cliente pidio ajustar alcance, material, precio o fecha. |
| `cliente_acepta_tentativo` | El cliente mostro interes o acepto la propuesta tentativa. |
| `desglose_tecnico` | Se prepara diseno tecnico, piezas, herrajes y lista de corte. |
| `consulta_maderera` | Se consulta disponibilidad, precio y demora de corte. |
| `consulta_operativa` | Se revisa capacidad de Diego, Joel, instalador o terceros. |
| `fecha_tentativa_generada` | Hay una fecha posible, aun no confirmada. |
| `esperando_autorizacion_final_diego` | Diego debe aprobar precio, fecha, diseno o avance. |
| `aprobado_para_confirmar` | La orden puede confirmarse formalmente al cliente. |
| `confirmado_con_cliente` | Cliente recibio confirmacion formal. |
| `esperando_sena` | Falta registrar sena cuando corresponda. |
| `sena_recibida` | La sena fue registrada. |
| `en_diseno_final` | Se completa el diseno tecnico final. |
| `en_corte` | Materiales enviados o listos para corte. |
| `en_montaje` | Piezas en armado o preinstalacion. |
| `en_instalacion` | Trabajo en instalacion. |
| `instalado` | Instalacion completada. |
| `postventa` | Seguimiento posterior, ajustes o garantia. |
| `cerrado` | Orden finalizada administrativamente. |
| `cancelado` | Orden cancelada. |

## Estados por bloqueos

| Estado | Descripcion |
| --- | --- |
| `pausado_por_cliente` | El cliente no envio informacion, no respondio o pidio pausar. |
| `pausado_por_obra` | La obra o constructora tiene pendientes que impiden avanzar. |
| `pausado_por_proveedor` | El proveedor o maderera no confirmo o no entrego. |
| `esperando_entrega_externa` | Falta una entrega externa, como puertas, herrajes o material de terceros. |
| `reactivacion_pendiente` | Una orden pausada pidio volver a avanzar y requiere revision. |
| `reactivado_en_revision` | Planeamiento y Diego estan evaluando capacidad y pendientes. |
| `bloqueado_por_dependencia` | Existe una condicion necesaria abierta. |
| `conflicto_de_agenda` | La fecha propuesta cruza con otros trabajos o supera capacidad. |
