# Arquitectura del Motor de Diseño Rubik

## 1. Objetivo del Motor de Diseño Rubik

El Motor de Diseño Rubik / Design Engine es el núcleo funcional que transforma medidas tomadas en obra en un diseño preliminar de mueble, piezas técnicas, cantos, uso de materiales, lista de corte, cotización preliminar y una representación 3D inicial.

El objetivo no es copiar PolyBoard ni depender de él. Rubik OS construye su propio modelo de datos y sus propias reglas de diseño para reflejar cómo trabaja Rubik Carpintería.

## 2. Flujo general

```text
medidas tomadas en obra → plantilla de mueble → módulos → piezas → 3D → cutlist → cotización → validación Diego
```

1. Diego, Joel u otro responsable autorizado carga medidas tomadas en obra.
2. Rubik OS selecciona o recibe una plantilla de mueble.
3. El motor valida estructura total y módulos internos.
4. El motor genera piezas preliminares.
5. El motor genera un descriptor 3D propio, basado primero en cajas/cubos.
6. El motor convierte las piezas en `cutlistItems` preliminares.
7. El motor calcula uso aproximado de placa, cantos y totales de cotización.
8. Diego valida antes de aprobar corte, compra o envío a proveedor.

## 3. Entradas

- tipo de mueble
- ancho, alto, profundidad
- espesor material
- fondo sí/no
- zócalo sí/no
- módulos internos
- puertas
- cajones
- estantes
- material
- cantos
- herrajes
- responsable de medición: Diego / Joel / otro
- observaciones de obra

## 4. Salidas

- `designResult`
- `designWarnings`
- `3D model descriptor`
- `cutlistItems`
- `materialUsage`
- `edgeBandUsage`
- `quoteTotals`
- `validationRequiredByDiego`

## 5. Diferencia conceptual

- Datos de entrada = estructura total del mueble.
- Módulos internos = divisiones dentro de esa estructura.
- Puertas/cajones/frentes = piezas que nacen de cada módulo.
- Lista de corte = resultado técnico.
- Cotización = resultado económico.

Esta separación evita confundir medidas generales tomadas en obra con dimensiones internas de cada módulo.

## 6. Vista 3D inicial

- No usar motor 3D complejo todavía.
- Crear primero un modelo descriptivo propio basado en cajas/cubos.
- Cada pieza puede representarse como un prisma rectangular con:
  - `x`
  - `y`
  - `z`
  - `width`
  - `height`
  - `depth`
  - `material`
  - `label`
- Luego se podrá renderizar con Three.js u otra librería si el proyecto la adopta.

El descriptor 3D inicial no es un archivo de fabricación ni un formato propietario. Es un contrato interno de Rubik OS para visualización preliminar y validación humana.

## 7. Seguridad

- Todo diseño requiere validación de Diego.
- Nada se manda a maderera sin aprobación.
- Los datos de obra deben quedar trazables.
- Si hay conflicto entre medidas generales y módulos internos, el sistema debe advertirlo.
- Si falta información de obra, conexiones, escuadra, plomo o material, el sistema debe pedir validación antes de avanzar.
