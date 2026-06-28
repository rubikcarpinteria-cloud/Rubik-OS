import { loadPublicEnvironment } from './env';
import { createPublicSupabaseClient } from './supabase';

export function App() {
  const environment = loadPublicEnvironment();
  const supabase = createPublicSupabaseClient(environment);

  return (
    <main>
      <p>Rubik Carpintería</p>
      <h1>Rubik OS</h1>
      <p>Entorno de desarrollo inicial.</p>
      <dl>
        <dt>Frontend</dt>
        <dd>Listo</dd>
        <dt>Supabase</dt>
        <dd>{supabase === null ? 'Pendiente de credenciales' : 'Configurado'}</dd>
      </dl>
    </main>
  );
}
