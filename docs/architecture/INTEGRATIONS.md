# Integrations

Este documento registra integraciones futuras. No se implementan integraciones reales en esta tarea.

Las integraciones deben apoyar a Rubik OS, no reemplazar su nucleo. La orden de trabajo sigue siendo el centro del sistema y las herramientas externas solo aportan canales, archivos, calendario, calculos o diseno complementario.

## Integraciones previstas

| Integracion | Para que serviria | Datos que entran | Datos que salen | Riesgos o cuidados | Prioridad |
| --- | --- | --- | --- | --- | --- |
| WhatsApp Business | Atender consultas, recibir fotos, enviar seguimientos y confirmar informacion. | Mensajes, audios, fotos, videos, datos de contacto. | Respuestas, pedidos de datos, resumenes, estados permitidos. | No prometer precio o fecha sin Diego; cuidar tono humano y privacidad. | Prioritaria |
| Instagram | Capturar consultas desde perfil, publicaciones o mensajes directos. | Usuario, mensajes, referencias visuales, fotos. | Respuestas iniciales y derivacion a orden. | Contexto incompleto; no perder trazabilidad al pasar a WhatsApp. | Prioritaria |
| TikTok | Capturar interes generado por videos o contenido. | Usuario, comentarios, mensajes, referencia del video. | Respuesta inicial y registro de origen. | Consultas de bajo contexto; evitar promesas rapidas. | Futura |
| Gmail/mail | Gestionar pedidos formales, archivos, planos y comunicaciones con obras. | Emails, adjuntos, planos, presupuestos externos. | Respuestas, resumenes, tareas y archivos vinculados. | Adjuntos pesados, versiones duplicadas y datos sensibles. | Prioritaria |
| Google Calendar | Visualizar fechas tentativas y confirmadas. | Fechas, eventos, disponibilidad declarada. | Eventos propuestos o confirmados. | Calendar no decide viabilidad; Rubik OS debe validar condiciones. | Prioritaria |
| Google Drive | Guardar fotos, planos, documentos y entregables. | Archivos de cliente, obra, proveedor o diseno. | Links y documentos organizados por orden. | Permisos, duplicados y perdida de relacion con la orden. | Futura |
| Supabase | Base de datos, autenticacion, storage y backend operativo. | Clientes, ordenes, tareas, archivos, eventos. | Datos consultables por app, IA y backend. | RLS, permisos, backups y auditoria. | Prioritaria |
| OpenAI API | IA de ventas, resumenes, deteccion de faltantes y planeamiento asistido. | Conversaciones, datos de orden, reglas de negocio. | Resumenes, alertas, propuestas preliminares. | No delegar decisiones criticas; controlar datos sensibles. | Prioritaria |
| Excel/Google Sheets | Importar o exportar costos, listas de corte y control operativo. | Tablas de precios, materiales, cortes, tareas. | Reportes, presupuestos auxiliares, listas. | Versiones desactualizadas y formulas no auditadas. | Futura |
| PolyBoard opcional | Apoyo externo para diseno tecnico o validacion puntual. | Medidas, modulos, materiales. | Archivos o listas tecnicas. | No convertirlo en dependencia central. | Opcional |
| SketchUp opcional | Visualizacion o modelado externo cuando aporte al cliente. | Medidas, referencias, modelos. | Vistas o archivos de apoyo. | Puede alejarse del despiece real si no se controla. | Opcional |
| FreeCAD opcional | Modelado tecnico parametrico o pruebas de piezas. | Parametros, medidas, piezas. | Modelos tecnicos o exportaciones. | Complejidad operativa y curva de uso. | Opcional |
| Optimizador de corte | Optimizar placas, desperdicio y listas de corte. | Piezas, espesores, vetas, cantos, placas. | Planes de corte y aprovechamiento. | Debe respetar reglas reales de maderera y sentido de veta. | Futura |

## Regla de implementacion

Antes de integrar cualquier servicio externo, debe definirse que entidad de Rubik OS sera la fuente de verdad, que datos se sincronizan, que permisos se necesitan y que pasa si la integracion falla.
