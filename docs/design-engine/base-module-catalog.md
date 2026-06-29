# Catálogo de Módulos Bajos Prediseñados Rubik

## 1. Objetivo

Rubik OS debe permitir diseñar muebles combinando módulos bajos prediseñados. La persona carga la medida del espacio disponible, selecciona módulos internos y Rubik OS valida si esos módulos entran en el ancho total antes de generar diseño, despiece, cutlist y cotización preliminar.

## 2. Concepto

- El espacio disponible define el ancho total.
- Los módulos prediseñados son unidades internas.
- Cada módulo tiene medidas, tipo, accesorios y reglas.
- Los módulos se acomodan en orden para completar el espacio.
- Si no coinciden con el ancho total, Rubik OS debe advertir ajuste o módulo especial.
- El diseño final requiere validación de Diego.

## 3. Tipos de módulos iniciales

- puertas
- cajonera
- estantes abiertos
- piletero
- ajuste/relleno
- porta horno futuro
- alacena futura

## 4. Datos de cada módulo

- código
- nombre
- ancho
- alto
- profundidad
- tipo
- puertas
- cajones
- estantes
- material sugerido
- herrajes sugeridos
- cantos
- notas
- requiere validación Diego

## 5. Flujo

```text
Medida del espacio → selección de módulos → validación de suma → generación de designInput → despiece → 3D → cutlist → cotización
```

El catálogo es preliminar. Los módulos pueden ajustarse según obra, pero todo resultado técnico o económico requiere validación de Diego antes de avanzar a cliente o maderera.
