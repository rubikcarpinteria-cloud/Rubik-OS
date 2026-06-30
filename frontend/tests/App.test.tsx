import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../src/App';

describe('App', () => {
  it('renders the visual module catalog with standard modules', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Módulos prediseñados' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Bajo puertas' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: 'Cajonera' }).length).toBeGreaterThan(0);
    expect(screen.getByText('400 mm - 1.000 mm')).toBeInTheDocument();
  });

  it('adds a module from a catalog card and renders it in the workspace', () => {
    render(<App />);

    const sinkCard = screen.getAllByRole('heading', { name: 'Bajo bacha' })[0]?.closest('article');

    expect(sinkCard).not.toBeNull();
    fireEvent.click(within(sinkCard as HTMLElement).getByRole('button', { name: 'Agregar' }));

    const workspace = screen.getByLabelText('Constructor de cocina');

    expect(
      within(workspace).getByRole('button', { name: /Seleccionar Bajo bacha/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Usado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3.800 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('200 mm').length).toBeGreaterThan(0);
  });

  it('edits module width and recalculates used and remaining space', () => {
    render(<App />);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Editar ancho' }), {
      target: { value: '400' },
    });

    expect(screen.getAllByText('400 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.500 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.100 mm').length).toBeGreaterThan(0);
  });

  it('moves module order with the selected module controls', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Cajonera 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mover izquierda' }));

    const technicalRows = within(
      screen.getByRole('region', { name: 'Instancias de módulo' }),
    ).getAllByRole('row');

    expect(within(technicalRows[1] as HTMLElement).getByText('Cajonera')).toBeInTheDocument();
    expect(within(technicalRows[2] as HTMLElement).getByText('Bajo puertas')).toBeInTheDocument();
  });

  it('deletes the selected module from the workspace', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Mueble horno 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    const workspace = screen.getByLabelText('Constructor de cocina');

    expect(
      within(workspace).queryByRole('button', { name: /Mueble horno/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('2.400 mm').length).toBeGreaterThan(0);
  });
});
