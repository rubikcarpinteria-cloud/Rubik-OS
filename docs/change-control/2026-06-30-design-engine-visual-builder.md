# 2026-06-30 - Motor de Diseño visual modular

## Cambio

El Motor de Diseño Rubik evoluciona desde una demo principalmente tabular hacia un constructor
visual modular tipo Tetris/PolyBoard.

La experiencia principal ahora prioriza:

- Catálogo visual de tarjetas con módulos prediseñados.
- Pared de diseño con regla en milímetros y bloques proporcionales al ancho.
- Módulos seleccionables con edición de ancho, movimiento izquierda/derecha y eliminación.
- Soporte inicial de drag and drop desde tarjeta hacia la pared.
- Visor 3D existente conectado a la composición actual.
- Tablas técnicas conservadas como detalle secundario para validación, despiece, cutlist y
  cotización preliminar.

## Alcance incremental

El cambio mantiene `DemoModuleTemplate` y `DemoSelectedBaseModule` como la separación entre
plantillas e instancias. La pared de diseño sigue calculando espacio usado, espacio restante y
exceso desde la misma composición modular que alimenta el despiece y la cotización.

## Reglas preservadas

- Rangos de ancho mínimo y máximo por plantilla.
- Recalculo de espacio usado/restante/exceso.
- Regla automática de una puerta cuando un módulo de puertas baja a 400 mm.
- Generación de piezas, cutlist y cotización preliminar.
- Advertencias de validación para mediciones preliminares y exceso/faltante de ancho.

## Motivo

La tabla técnica sirve para auditoría interna, pero la experiencia final necesita que el usuario vea
cómo se arma la cocina o bajo mesada con módulos visuales. Esta iteración cambia la demo hacia una
interacción más cercana a PolyBoard: elegir módulos, componerlos en una pared y ajustar el diseño
viendo el impacto inmediato.
