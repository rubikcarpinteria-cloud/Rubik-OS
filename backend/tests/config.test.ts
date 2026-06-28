import { describe, expect, it } from 'vitest';

import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('uses safe local defaults', () => {
    expect(loadConfig({ APP_ENV: 'test' })).toMatchObject({
      APP_ENV: 'test',
      BACKEND_HOST: '127.0.0.1',
      BACKEND_PORT: 3001,
      FRONTEND_ORIGIN: 'http://localhost:3000',
    });
  });

  it('rejects partial Supabase configuration', () => {
    expect(() =>
      loadConfig({ APP_ENV: 'test', SUPABASE_URL: 'https://example.supabase.co' }),
    ).toThrow(/must either both be configured or both omitted/);
  });
});
