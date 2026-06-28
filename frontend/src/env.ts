import { z } from 'zod';

const publicEnvironmentSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3001'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  VITE_SUPABASE_URL: z.url().optional(),
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

export function loadPublicEnvironment(
  environment: Record<string, unknown> = import.meta.env,
): PublicEnvironment {
  const result = publicEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    throw new Error(`Invalid public environment configuration: ${z.prettifyError(result.error)}`);
  }

  const hasUrl = result.data.VITE_SUPABASE_URL !== undefined;
  const hasAnonKey = result.data.VITE_SUPABASE_ANON_KEY !== undefined;

  if (hasUrl !== hasAnonKey) {
    throw new Error(
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must either both be configured or both omitted.',
    );
  }

  return result.data;
}
