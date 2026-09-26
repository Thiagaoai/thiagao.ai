// Runs the whole Farmz3D + DockPlus platform locally with zero setup:
//   npm run farmz3d:local
// Orders, decisions and positions are saved to .data/local-db.json (development only).
// Real values in .env.local (e.g. Supabase, Resend, TYPESAFE_API_KEY) take precedence.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const port = process.env.PORT || '3002';

const defaults = {
  LOCAL_DEMO_DB: '1',
  ADMIN_DASHBOARD_USER: 'admin',
  ADMIN_DASHBOARD_PASSWORD: 'farmz3d-local',
  ADMIN_DASHBOARD_TOKEN: 'local-dev-session',
  ADMIN_API_TOKEN: 'local-dev-api',
  FARMZ3D_ORDERS_EMAIL: 'orders@localhost.invalid',
};
const env = { ...defaults, ...process.env };

console.log(`
  Farmz3D + DockPlus — local
  ─────────────────────────────────────────────
  Loja (e-commerce):   http://localhost:${port}/farmz3d
  Reviews Machine:     http://localhost:${port}/reviews-machine
  Demo de avaliação:   http://localhost:${port}/r/demo
  Painel (decisões):   http://localhost:${port}/admin/login
                       usuário: ${env.ADMIN_DASHBOARD_USER}   senha: ${env.ADMIN_DASHBOARD_PASSWORD}
  Banco local:         .data/local-db.json ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '(ignorado: Supabase real configurado)' : ''}
  Jev (TypeSafe):      ${env.TYPESAFE_API_KEY ? 'ligado' : 'desligado — defina TYPESAFE_API_KEY em .env.local para ativar'}
`);

const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '-p', port, '--hostname', 'localhost'], {
  env,
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
