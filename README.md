# Rubik OS

Sistema operativo interno de **Rubik Carpintería** para acompañar sus procesos de diseño, fabricación e instalación de muebles a medida.

## Estado

Proyecto en etapa de inicialización. La estructura base del repositorio está preparada; todavía no contiene lógica de negocio ni código de aplicación.

## Estructura

- `database/`: esquema, migraciones, datos de desarrollo y pruebas de PostgreSQL/Supabase.
- `backend/`: servicios y API del sistema.
- `frontend/`: aplicaciones e interfaces de usuario.
- `automations/`: procesos automáticos y tareas programadas.
- `integrations/`: adaptadores para servicios externos.
- `ai/`: componentes, evaluaciones y configuración de inteligencia artificial.
- `design-system/`: fundamentos y componentes visuales compartidos.
- `knowledge/`: conocimiento operativo curado para consumo del sistema y la IA.
- `docs/`: documentación técnica, funcional y operativa.
- `scripts/`: utilidades de desarrollo y mantenimiento.

## Documentación principal

El alcance, los principios y la hoja de ruta de alto nivel se mantienen en [`MASTERPLAN.md`](MASTERPLAN.md). Las decisiones de arquitectura se registrarán como ADR en `docs/adr/`.

## Desarrollo

Los requisitos, comandos y convenciones se documentarán a medida que el stack de implementación sea definido y aprobado. Nunca deben guardarse secretos en el repositorio; `.env.example` contiene únicamente nombres de variables.

## Licencia

Licencia pendiente de definición por la Dirección del Proyecto. Consultar [`LICENSE`](LICENSE).
