# 2026-06-30 - Motor de Diseño visual modular

## Cambio

El Motor de Diseño Rubik evoluciona desde una demo técnica basada en tabla hacia un
constructor visual modular tipo Tetris/PolyBoard.

La experiencia principal pasa a estar compuesta por:

- Catálogo visual de tarjetas con módulos prediseñados.
- Pared de diseño con regla en milímetros y bloques proporcionales al ancho.
- Editor de módulo seleccionado para ancho, orden y eliminación.
- Visor 3D preliminar conectado a la composición actual.
- Detalle técnico tabular conservado como soporte secundario.

## Alcance incremental

La primera versión mantiene una interacción funcional mediante botones:

- Agregar módulo desde tarjeta.
- Seleccionar bloque en la pared.
- Editar ancho respetando rango mínimo y máximo.
- Mover módulos a izquierda o derecha.
- Eliminar módulos.

La arquitectura queda preparada para drag and drop real porque el catálogo usa
`moduleTemplate`, la pared trabaja con `moduleInstance`, y el orden de módulos se
resuelve como una lista de instancias.

## Reglas preservadas

- Anchos estándar, mínimos y máximos por módulo.
- Recalculo de espacio usado, restante y exceso.
- Regla automática de una puerta cuando un módulo de puertas baja a 400 mm.
- Superficie para despiece, cutlist y cotización preliminar.

## Motivo

La tabla técnica es útil para validación interna, pero no comunica la experiencia
final que necesita Rubik: armar una cocina o bajo mesada viendo cómo se compone el
frente modular y cómo impactan los anchos en el espacio disponible.
