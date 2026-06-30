# Design Engine

El Motor de Diseno Rubik es el nucleo propio de diseno tecnico del sistema. Debe generar propuestas tecnicas, despieces, piezas, cantos, herrajes sugeridos, listas de corte, advertencias y vistas tecnicas conectadas a cada orden de trabajo.

Rubik OS no debe depender de PolyBoard como nucleo. PolyBoard, SketchUp o FreeCAD pueden usarse como herramientas externas opcionales, pero el flujo central debe vivir dentro del Motor de Diseno Rubik.

## Objetivo inicial

La primera meta visual no es un render realista. Es una vista tecnica 3D o de despiece que ayude a Diego a revisar rapido medidas, estructura, piezas, cantos, estantes, refuerzos y riesgos.

Primero debe generar una mini propuesta visual o tecnica para Diego. Luego podra evolucionar hacia un editor tipo PolyBoard, con edicion de modulos, reglas, materiales, cantos y herrajes.

## Modulos estandar iniciales

- `bajo_mesada`
- `bajo_mesada_dos_puertas`
- `alacena`
- `torre_horno`
- `placard`
- `cajonera`
- `rack_tv`
- `biblioteca`
- `escritorio`
- `mueble_bano`

## Reglas base: bajo_mesada_dos_puertas

- Alto: 720 mm.
- Profundidad final con puertas: 620 mm.
- Melamina general: 18 mm.
- Fondo: 3 mm.
- Cantos exteriores: 2 mm.
- Cantos interiores: 1 mm o 0.45 mm segun costo.
- Luz entre puertas y laterales: 2 mm.
- Dos puertas cuando el ancho lo permita.
- Estante medio.
- Refuerzos o pagantes superiores y traseros.
- Fondo encastrado.

## Salidas del motor

- Piezas.
- Medidas.
- Cantos.
- Herrajes sugeridos.
- Lista de corte.
- Vista tecnica 3D.
- Advertencias si faltan datos.

## Advertencias esperadas

El motor debe advertir cuando falten medidas, haya dudas de escuadra, no exista altura disponible, la profundidad sea insuficiente, falte definir material, el ancho no permita dos puertas comodas o una regla tecnica requiera aprobacion de Diego.

## Integracion con el flujo

El diseno no es un archivo aislado. Debe estar conectado a la orden de trabajo, al presupuesto, a la lista de corte, a proveedores, a produccion y a instalacion. Cada version relevante debe quedar registrada para que Diego pueda comparar cambios y aprobar la version final.
