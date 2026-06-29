# Demo beta Design Engine - 2026-06-29

## Estado beta interna

- La pantalla `/demo/design-engine` queda como demo interna/beta para validar visualmente el Motor de Diseño Rubik v0.
- No guarda datos en base de datos.
- No envía listas de corte a proveedor.
- No marca piezas como aprobadas para corte.

## Corrección de claridad: módulos internos

- Se corrigió la sección `Módulos iniciales` a `Módulos internos del bajo mesada`.
- Se agregó ayuda visible explicando que estos módulos son las divisiones internas que componen el ancho total del bajo mesada.
- Se agregó explicación visible de la lógica:
  - Datos de entrada = estructura total del mueble.
  - Módulos internos = divisiones dentro de esa estructura.
  - Puertas/cajones/frentes = piezas que nacen de cada módulo.
  - Si cambia el módulo, cambian las piezas.
  - Si cambia el ancho total, debe revisarse la suma de módulos.
- Se agregó resumen visual con ancho total, suma de módulos internos y diferencia.
- Se agregaron estados visuales:
  - Rojo si la suma de módulos supera el ancho total.
  - Amarillo si la suma de módulos es menor que el ancho total.
  - Verde si la suma de módulos coincide con el ancho total.

## Corrección de zócalo condicional

- Se detectó que la demo pedía altura de zócalo aunque el bajo mesada no llevara zócalo.
- Se corrigió para que el zócalo sea opcional.
- Si no se incluye zócalo, la altura queda en 0 mm y no se genera pieza.
- Si se incluye zócalo, se solicita altura válida.
- Esto evita errores de interpretación en despiece y cotización preliminar.

## Corrección de fuente del manual

- Inicialmente se indicó 4, 5 y 9 por error.
- La fuente válida para reglas de alacenas queda corregida a páginas 2 y 5.
- Las páginas 4 y 9 no quedan como fuente activa para modulación.
- La referencia activa queda documentada en `knowledge/manuals/README.md`.

## Validación por capturas de la usuaria

- Las correcciones responden a problemas detectados visualmente en capturas compartidas por la usuaria durante la revisión de la demo beta.
- La demo debe priorizar claridad operativa para evitar interpretar módulos internos como medidas externas del mueble.

## Problemas detectados durante la validación local

- Se detectó `ERR_CONNECTION_REFUSED` al intentar abrir la demo antes de levantar el servidor dev.
- PowerShell normal no reconocía `pnpm` ni `corepack`.
- Codex levantó el servidor dev usando el runtime de Codex y el `pnpm.cmd` ya usado para `pnpm validate`.
- La ruta `http://localhost:3000/demo/design-engine` respondió `STATUS=200`.

## Decisión estratégica — Rubik OS como motor propio de diseño

- La usuaria definió que Rubik OS debe tomar como referencia funcional a PolyBoard, pero no depender de PolyBoard como núcleo.
- Rubik OS debe diseñar a partir de medidas tomadas por Diego o Joel.
- El sistema debe generar diseño 3D, despiece, piezas, cantos, lista de corte y cotización preliminar.
- PolyBoard, SketchUp o FreeCAD quedan como herramientas externas opcionales.
- La validación final continúa siendo responsabilidad de Diego.
