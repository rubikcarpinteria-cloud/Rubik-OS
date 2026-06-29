import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from '../src/App';

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
    expect(screen.getByText('Suma módulos')).toBeInTheDocument();
    expect(screen.getByText('Diferencia')).toBeInTheDocument();
  });

  it('shows red and yellow alerts when internal module widths do not match', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.change(screen.getByLabelText('Ancho mueble (mm)'), { target: { value: '1000' } });

    expect(
      screen.getByText('Alerta roja: la suma de módulos supera el ancho total.'),
    ).toBeInTheDocument();
    expect(screen.getByText('+800 mm')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Ancho mueble (mm)'), { target: { value: '1900' } });

    expect(
      screen.getByText('Alerta amarilla: la suma de módulos es menor que el ancho total.'),
    ).toBeInTheDocument();
    expect(screen.getByText('-100 mm')).toBeInTheDocument();
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
  });

  it('asks for toe kick height only when toe kick is included', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    fireEvent.change(screen.getByLabelText('Alto zócalo (mm)'), { target: { value: '0' } });

    expect(screen.getByText('Si incluís zócalo, indicá la altura del zócalo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Notas de demo')).toHaveTextContent('Cotización preliminar');
  });
});
