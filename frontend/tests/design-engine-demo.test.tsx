import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from '../src/App';

const SIMPLE_3D_VALIDATION_WARNING =
  'Vista 3D técnica preliminar — no apta para fabricación sin validación de Diego.';

describe('Design engine internal demo', () => {
  afterEach(() => {
    cleanup();
    window.history.pushState(null, '', '/');
  });

  it('renders the internal kitchen base cabinet demo route', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Demo Rubik OS - Bajo Mesada' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cotización preliminar sujeta a validación de Diego y actualización de precios de materiales.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Seleccioná al menos un módulo prediseñado/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Módulos internos del bajo mesada' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Ancho módulo de puertas (mm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Ancho módulo cajonera (mm)')).toBeInTheDocument();
  });

  it('shows internal modules guidance and width validation', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(
      screen.getByText(
        'Estos módulos son las divisiones internas que componen el ancho total del bajo mesada. La suma de los módulos debe coincidir con el ancho total del mueble.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Alerta amarilla: la suma de módulos es menor que el ancho total.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ancho total')).toBeInTheDocument();
    expect(screen.getAllByText('Suma módulos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Diferencia').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the predefined base module catalog section', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Catálogo de módulos prediseñados' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Seleccioná o cargá módulos prediseñados para componer el ancho total del bajo mesada.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' })).toBeInTheDocument();
  });

  it('shows the empty simple technical 3d viewer state on initial load', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Vista 3D técnica preliminar' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Agregá módulos desde el catálogo para generar la vista técnica.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: 'Vista técnica del bajo mesada' }),
    ).not.toBeInTheDocument();
  });

  it('loads the generic modular base cabinet example', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));

    expect(screen.getByLabelText('Ancho mueble (mm)')).toHaveValue(1800);
    expect(screen.getByLabelText('Alto mueble (mm)')).toHaveValue(720);
    expect(screen.getByLabelText('Profundidad (mm)')).toHaveValue(620);
    expect(screen.getAllByText('1.800 mm').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Ejemplo puertas 800 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ejemplo cajonera 560 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ejemplo bajo bacha 440 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Estado: encaja')).toBeInTheDocument();
    expect(screen.queryByText(/cliente real/i)).not.toBeInTheDocument();
  });

  it('updates the simple 3d viewer with the generic example', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));

    expect(screen.getByRole('img', { name: 'Vista técnica del bajo mesada' })).toBeInTheDocument();
    expect(screen.getAllByText('1.800 mm').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('720 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('620 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(SIMPLE_3D_VALIDATION_WARNING)).toBeInTheDocument();
  });

  it('shows red and yellow alerts when internal module widths do not match', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));
    fireEvent.change(screen.getByLabelText('Ancho mueble (mm)'), { target: { value: '1000' } });

    expect(
      screen.getByText('Alerta roja: la suma de módulos supera el ancho total.'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('+800 mm').length).toBeGreaterThanOrEqual(1);

    fireEvent.change(screen.getByLabelText('Ancho mueble (mm)'), { target: { value: '1900' } });

    expect(
      screen.getByText('Alerta amarilla: la suma de módulos es menor que el ancho total.'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('-100 mm').length).toBeGreaterThanOrEqual(1);
  });

  it('treats toe kick height as optional when toe kick is not included', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByLabelText('Incluir zócalo'));

    expect(screen.queryByLabelText('Alto zócalo (mm)')).not.toBeInTheDocument();
    expect(screen.getByText('Sin zócalo: altura tomada como 0 mm.')).toBeInTheDocument();
    expect(
      screen.queryByText('Si incluís zócalo, indicá la altura del zócalo.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Frente de zócalo')).not.toBeInTheDocument();
    expect(screen.queryByText('Zócalo 100 mm')).not.toBeInTheDocument();
  });

  it('asks for toe kick height only when toe kick is included', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.change(screen.getByLabelText('Alto zócalo (mm)'), { target: { value: '0' } });

    expect(screen.getByText('Si incluís zócalo, indicá la altura del zócalo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Notas de demo')).toHaveTextContent('Cotización preliminar');
  });
  it('shows the smart standard module library', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Biblioteca de módulos inteligentes' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Armado modular tipo Tetris:', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar Bajo mesada bacha' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar Columna despensa' })).toBeInTheDocument();
  });

  it('adds a standard module from the library to the wall', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Agregar Bajo mesada bacha' }));

    expect(screen.getAllByText('Bajo mesada bacha').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Módulo piletero con fondo y calados a validar.')).toBeInTheDocument();
  });

  it('renders the visual modular catalog and design wall', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Catálogo visual de módulos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Espacio de trabajo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Regla visual en milímetros')).toBeInTheDocument();
    expect(screen.getByLabelText('Pared de diseño')).toBeInTheDocument();
    expect(screen.getAllByText('Ancho estándar').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Rango').length).toBeGreaterThanOrEqual(1);
  });

  it('adds a visual catalog card to the design wall', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Agregar Bajo mesada bacha' }));

    const wall = screen.getByLabelText('Pared de diseño');

    expect(
      within(wall).getByRole('button', { name: /Seleccionar módulo 1: Bajo mesada bacha/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('800 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1.000 mm').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the 3d technical view when a module is added manually', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Agregar Bajo mesada bacha' }));

    expect(screen.getByRole('img', { name: 'Vista técnica del bajo mesada' })).toBeInTheDocument();
    expect(
      screen.queryByText('Agregá módulos desde el catálogo para generar la vista técnica.'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('800 mm').length).toBeGreaterThanOrEqual(1);
  });

  it('edits width from the visual selected module editor and recalculates space', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));
    fireEvent.change(screen.getByLabelText('Editar ancho de Ejemplo puertas 800 mm'), {
      target: { value: '400' },
    });

    expect(screen.getByText('Ajuste automático: ancho 400 mm usa 1 puerta.')).toBeInTheDocument();
    expect(screen.getAllByText('1.400 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('400 mm').length).toBeGreaterThanOrEqual(1);
  });

  it('moves module order from the visual wall controls', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Seleccionar módulo 2: Ejemplo cajonera 560 mm' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mover izquierda' }));

    const technicalTable = screen.getByRole('table', {
      name: 'Módulos inteligentes agregados a la pared',
    });
    const rows = within(technicalTable).getAllByRole('row');

    expect(within(rows[1] as HTMLElement).getByText('Ejemplo cajonera 560 mm')).toBeInTheDocument();
    expect(within(rows[2] as HTMLElement).getByText('Ejemplo puertas 800 mm')).toBeInTheDocument();
  });

  it('removes a module from the visual wall controls', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Seleccionar módulo 2: Ejemplo cajonera 560 mm' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar módulo' }));

    const wall = screen.getByLabelText('Pared de diseño');

    expect(
      within(wall).queryByRole('button', {
        name: /Seleccionar módulo .*Ejemplo cajonera 560 mm/,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('1.240 mm').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the 3d technical view when modular workspace has modules', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));
    fireEvent.change(screen.getByLabelText('Alto zócalo (mm)'), { target: { value: '0' } });

    expect(screen.getByRole('img', { name: 'Vista técnica del bajo mesada' })).toBeInTheDocument();
    expect(
      screen.queryByText('Agregá módulos desde el catálogo para generar la vista técnica.'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(SIMPLE_3D_VALIDATION_WARNING)).toBeInTheDocument();
  });

  it('shows the empty 3d message only when there are no modular workspace modules', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(
      screen.queryByRole('img', { name: 'Vista técnica del bajo mesada' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Agregá módulos desde el catálogo para generar la vista técnica.'),
    ).toBeInTheDocument();
  });

  it('shows drawer divisions in the 3d technical view', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));
    expect(
      screen.getByLabelText('Divisiones de cajones de Ejemplo cajonera 560 mm'),
    ).toBeInTheDocument();
  });

  it('shows doors in the 3d technical view', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));
    expect(screen.getByLabelText('Puertas de Ejemplo puertas 800 mm')).toBeInTheDocument();
  });

  it('recalculates the door count automatically when a smart module width changes', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar ejemplo de cocina' }));
    fireEvent.change(screen.getByLabelText('Ancho módulo inteligente 1'), {
      target: { value: '400' },
    });

    expect(screen.getByText('Ajuste automático: ancho 400 mm usa 1 puerta.')).toBeInTheDocument();
  });
});
