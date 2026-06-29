import { DesignEngineDemo } from './demo/design-engine/DesignEngineDemo';
import { loadPublicEnvironment } from './env';
import { createPublicSupabaseClient } from './supabase';

export function App() {
  const currentPath = window.location.pathname;

  if (currentPath === '/demo/design-engine') {
    return <DesignEngineDemo />;
  }

  const environment = loadPublicEnvironment();
  const supabase = createPublicSupabaseClient(environment);

  return (
    <main>
      <p>Rubik Carpintería</p>
      <h1>Rubik OS</h1>
      <p>Entorno de desarrollo inicial.</p>
      <p>
        Demo interna: <a href="/demo/design-engine">Demo Rubik OS - Bajo Mesada</a>
      </p>
      <dl>
        <dt>Frontend</dt>
        <dd>Listo</dd>
        <dt>Supabase</dt>
        <dd>{supabase === null ? 'Pendiente de credenciales' : 'Configurado'}</dd>
      </dl>
    </main>
  );
}
