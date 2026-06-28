# Database

Esquema y evolución versionada de PostgreSQL/Supabase:

- `migrations/`: historial ordenado de cambios de base de datos.
- `functions/`: funciones versionadas.
- `policies/`: políticas de seguridad y Row Level Security.
- `views/`: vistas versionadas.
- `seeds/`: datos no sensibles para desarrollo y pruebas.
- `tests/`: pruebas de esquema, funciones, restricciones y políticas.

Todo cambio de Supabase deberá quedar representado y versionado en este directorio.
