import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from '../src/App';

const WHATSAPP_3070_WARNING =
  'Composición preliminar tomada de medición/foto WhatsApp. Validar en obra antes de corte.';
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
    expect(screen.getByRole('heading', { name: 'Lista de corte preliminar' })).toBeInTheDocument();
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
      screen.getByText('OK: la suma de módulos coincide con el ancho total.'),
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
    expect(
      screen.getByRole('button', { name: 'Cargar cocina WhatsApp 3070 mm' }),
    ).toBeInTheDocument();
  });

  it('shows the simple technical 3d viewer', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Vista 3D técnica preliminar' }),
    ).toBeInTheDocument();
    expect(screen.getByText(SIMPLE_3D_VALIDATION_WARNING)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Vista técnica del bajo mesada' })).toBeInTheDocument();
  });

  it('loads the WhatsApp 3070 mm kitchen preset', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar cocina WhatsApp 3070 mm' }));

    expect(screen.getByLabelText('Ancho mueble (mm)')).toHaveValue(3070);
    expect(screen.getByLabelText('Alto mueble (mm)')).toHaveValue(750);
    expect(screen.getByLabelText('Profundidad (mm)')).toHaveValue(650);
    expect(screen.getAllByText('3.070 mm').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Puertas doble 800 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cajonera 560 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Puertas doble 1000 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Relleno/ajuste 710 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Estado: encaja')).toBeInTheDocument();
    expect(screen.getAllByText(WHATSAPP_3070_WARNING).length).toBeGreaterThanOrEqual(1);
  });

  it('updates the simple 3d viewer with the WhatsApp 3070 mm preset', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Cargar cocina WhatsApp 3070 mm' }));

    expect(screen.getByRole('img', { name: 'Vista técnica del bajo mesada' })).toBeInTheDocument();
    expect(screen.getAllByText('3.070 mm').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('750 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('650 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(WHATSAPP_3070_WARNING).length).toBeGreaterThanOrEqual(1);
  });

  it('shows red and yellow alerts when internal module widths do not match', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

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
    expect(screen.getAllByText('Sin zócalo').length).toBeGreaterThanOrEqual(1);
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

  it('recalculates the door count automatically when a smart module width changes', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.change(screen.getByLabelText('Ancho módulo inteligente 1'), {
      target: { value: '400' },
    });

    expect(screen.getByText('Ajuste automático: ancho 400 mm usa 1 puerta.')).toBeInTheDocument();
  });
});
