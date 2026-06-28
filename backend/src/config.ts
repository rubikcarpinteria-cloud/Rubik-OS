import { z } from 'zod';

const environmentSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  BACKEND_HOST: z.string().min(1).default('127.0.0.1'),
  BACKEND_PORT: z.coerce.number().int().positive().max(65_535).default(3001),
  FRONTEND_ORIGIN: z.url().default('http://localhost:3000'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_URL: z.url().optional(),
});

export type AppConfig = z.infer<typeof environmentSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = environmentSchema.safeParse(environment);

  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${z.prettifyError(result.error)}`);
  }

  const hasUrl = result.data.SUPABASE_URL !== undefined;
  const hasServiceKey = result.data.SUPABASE_SERVICE_ROLE_KEY !== undefined;

  if (hasUrl !== hasServiceKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must either both be configured or both omitted.',
    );
  }

  return result.data;
}
