import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../src/App';

describe('App', () => {
  it('renders the temporary development status', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Rubik OS' })).toBeInTheDocument();
    expect(screen.getByText('Entorno de desarrollo inicial.')).toBeInTheDocument();
  });
});
