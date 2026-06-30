import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../src/App';

describe('Design engine visual modular builder', () => {
  it('renders the current visual modular builder instead of the previous demo route', () => {
    window.history.pushState(null, '', '/demo/design-engine');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Constructor visual modular' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Módulos prediseñados' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Espacio de trabajo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visor 3D' })).toBeInTheDocument();
    expect(screen.queryByText('Demo Rubik OS - Bajo Mesada')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cargar ejemplo de cocina' })).not.toBeInTheDocument();
  });

  it('shows the catalog, initial workspace modules, summary and technical table', () => {
    render(<App />);

    expect(screen.getAllByRole('heading', { name: 'Bajo puertas' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: 'Cajonera' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Mueble horno' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lavavajillas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bajo bacha' })).toBeInTheDocument();
    expect(screen.getByText('400 mm - 1.000 mm')).toBeInTheDocument();

    const workspace = screen.getByLabelText('Constructor de cocina');
    expect(
      within(workspace).getByRole('button', { name: 'Seleccionar Bajo puertas 1' }),
    ).toBeInTheDocument();
    expect(
      within(workspace).getByRole('button', { name: 'Seleccionar Cajonera 2' }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Resumen del espacio')).toHaveTextContent('3.600 mm');
    expect(screen.getAllByText('3.000 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('600 mm').length).toBeGreaterThan(0);

    const technicalRows = within(
      screen.getByRole('region', { name: 'Instancias de módulo' }),
    ).getAllByRole('row');

    expect(within(technicalRows[1] as HTMLElement).getByText('Bajo puertas')).toBeInTheDocument();
    expect(within(technicalRows[2] as HTMLElement).getByText('Cajonera')).toBeInTheDocument();
  });

  it('adds a module from the visual catalog and recalculates overflow', () => {
    render(<App />);

    const sinkCard = screen.getAllByRole('heading', { name: 'Bajo bacha' })[0]?.closest('article');

    expect(sinkCard).not.toBeNull();
    fireEvent.click(within(sinkCard as HTMLElement).getByRole('button', { name: 'Agregar' }));

    const workspace = screen.getByLabelText('Constructor de cocina');

    expect(
      within(workspace).getByRole('button', { name: /Seleccionar Bajo bacha 5/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('3.800 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('200 mm').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Resumen del espacio')).toHaveTextContent('Exceso 200 mm');
  });

  it('edits the selected module width and updates door count plus space metrics', () => {
    render(<App />);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Editar ancho' }), {
      target: { value: '400' },
    });

    expect(screen.getAllByText('400 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.500 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.100 mm').length).toBeGreaterThan(0);
    expect(screen.getByText(/puertas · 1 puertas/)).toBeInTheDocument();

    const technicalRows = within(
      screen.getByRole('region', { name: 'Instancias de módulo' }),
    ).getAllByRole('row');

    const firstModuleCells = within(technicalRows[1] as HTMLElement).getAllByRole('cell');

    expect(firstModuleCells[1]).toHaveTextContent('Bajo puertas');
    expect(firstModuleCells[3]).toHaveTextContent('400 mm');
    expect(firstModuleCells[4]).toHaveTextContent('1');
  });

  it('moves the selected module within the visual wall', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Cajonera 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mover izquierda' }));

    const technicalRows = within(
      screen.getByRole('region', { name: 'Instancias de módulo' }),
    ).getAllByRole('row');

    expect(within(technicalRows[1] as HTMLElement).getByText('Cajonera')).toBeInTheDocument();
    expect(within(technicalRows[2] as HTMLElement).getByText('Bajo puertas')).toBeInTheDocument();
  });

  it('removes the selected module from the workspace and technical detail', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Mueble horno 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    const workspace = screen.getByLabelText('Constructor de cocina');

    expect(
      within(workspace).queryByRole('button', { name: /Seleccionar Mueble horno/ }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('2.400 mm').length).toBeGreaterThan(0);

    const technicalRows = within(
      screen.getByRole('region', { name: 'Instancias de módulo' }),
    ).getAllByRole('row');

    expect(technicalRows).toHaveLength(4);
    expect(screen.queryByRole('cell', { name: 'Mueble horno' })).not.toBeInTheDocument();
  });

  it('keeps the connected 3d and technical summary in sync with the module list', () => {
    render(<App />);

    expect(screen.getByLabelText('Representación 3D de la composición actual')).toBeInTheDocument();
    expect(screen.getByText('Actualizado con 4 módulos')).toBeInTheDocument();
    expect(screen.getByText('20 piezas preliminares')).toBeInTheDocument();
    expect(screen.getByText('$144.000')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Lavavajillas 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(screen.getByText('Actualizado con 3 módulos')).toBeInTheDocument();
    expect(screen.getByText('15 piezas preliminares')).toBeInTheDocument();
    expect(screen.getByText('$115.200')).toBeInTheDocument();
  });
});
