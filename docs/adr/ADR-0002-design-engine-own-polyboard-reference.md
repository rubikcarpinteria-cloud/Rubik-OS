# ADR-0002 — Motor de Diseño Rubik propio inspirado en flujo tipo PolyBoard

## Estado

Aceptado

## Fecha

2026-06-29

## Contexto

Rubik OS necesita diseñar muebles a medida, generar despieces, listas de corte, cantos, herrajes, cotizaciones y eventualmente visualización 3D. PolyBoard se considera una referencia funcional del tipo de flujo esperado, pero no será dependencia central del sistema.

## Decisión

Rubik OS tendrá un motor propio llamado Motor de Diseño Rubik / Design Engine. Este motor recibirá medidas tomadas en obra por Diego, Joel u otro instalador autorizado, aplicará plantillas y reglas Rubik, y generará:

- estructura del mueble
- módulos internos
- piezas
- cantos
- herrajes estimados
- lista de corte preliminar
- cotización preliminar
- representación 3D inicial
- advertencias de validación

## Reglas

- PolyBoard puede servir como referencia conceptual/funcional.
- No copiar interfaz, código, formatos propietarios ni lógica cerrada de PolyBoard.
- Rubik OS debe mantener su propio modelo de datos.
- Todo diseño es preliminar hasta validación de Diego.
- Nada se manda a cortar automáticamente.
- El sistema debe registrar medidas, fuente de medición y responsable humano.
- Si hay conflicto entre medidas generales y módulos internos, Rubik OS debe advertirlo.
- Si falta información de obra, conexiones, escuadra, plomo o material, Rubik OS debe pedir validación.

## Consecuencias

- Rubik OS podrá funcionar sin depender de licencias caras.
- A futuro podrá integrarse con herramientas externas como PolyBoard, SketchUp o FreeCAD, pero como exportación/importación opcional.
- El Motor de Diseño Rubik será el núcleo del diseño, cotización y producción.
