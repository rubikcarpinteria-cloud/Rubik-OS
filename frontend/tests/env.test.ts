import { describe, expect, it } from 'vitest';

import { loadPublicEnvironment } from '../src/env';

describe('loadPublicEnvironment', () => {
  it('supports development without Supabase credentials', () => {
    expect(loadPublicEnvironment({})).toEqual({ VITE_API_URL: 'http://localhost:3001' });
  });

  it('rejects a partial public Supabase configuration', () => {
    expect(() =>
      loadPublicEnvironment({ VITE_SUPABASE_URL: 'https://example.supabase.co' }),
    ).toThrow(/must either both be configured or both omitted/);
  });
});
