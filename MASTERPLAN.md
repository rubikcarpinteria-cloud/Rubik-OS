# Rubik OS — Master Plan

## Propósito

Construir un sistema interno, exclusivo de Rubik Carpintería, que represente fielmente su forma de diseñar, fabricar e instalar muebles a medida.

Rubik OS no será un CRM genérico ni un ERP tradicional.

## Principios

1. Priorizar corrección, claridad y simplicidad.
2. Mantener una arquitectura modular, segura y sostenible.
3. Documentar y versionar todo cambio relevante.
4. Evolucionar la base de datos exclusivamente mediante migraciones.
5. No asumir reglas de negocio: deben ser definidas y validadas.
6. Registrar las decisiones arquitectónicas y sus motivos.
7. Incorporar integraciones sin acoplarlas al núcleo del sistema.

## Gobierno del proyecto

- **Product Owner:** define necesidades y valida que el producto represente el funcionamiento real de Rubik Carpintería.
- **CTO / Arquitectura:** define arquitectura, datos, reglas, flujos, integraciones y decisiones técnicas.
- **Lead Software Engineer:** implementa, verifica, documenta y mantiene la calidad técnica conforme a las definiciones aprobadas.

## Áreas del sistema

- Base de datos y seguridad de datos.
- Backend y contratos de API.
- Experiencia web y sistema de diseño.
- Automatizaciones e integraciones externas.
- Inteligencia artificial y gestión de conocimiento.
- Observabilidad, pruebas y operación.

## Integraciones previstas

- Supabase / PostgreSQL.
- OpenAI.
- WhatsApp Cloud API.
- Google Calendar.
- Google Drive.
- PolyBoard, en una etapa futura.

## Etapas de alto nivel

1. Descubrimiento y documentación de procesos.
2. Definición de arquitectura, dominio y seguridad.
3. Construcción incremental de capacidades validadas.
4. Integraciones y automatizaciones.
5. Pruebas operativas, adopción y mejora continua.

Las funcionalidades, prioridades y fechas se incorporarán únicamente después de su validación. Este documento no define reglas de negocio.
