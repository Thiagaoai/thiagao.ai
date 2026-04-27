import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from './supabase';

const ITERATIONS = 310_000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `pbkdf2:${ITERATIONS}:${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [scheme, iterations, salt, hash] = storedHash.split(':');
  if (scheme !== 'pbkdf2' || !iterations || !salt || !hash) return false;

  const candidate = pbkdf2Sync(password, salt, Number(iterations), KEY_LENGTH, DIGEST);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function toAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

export async function listAdminUsers() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ready: false, admins: [] as AdminUser[] };

  const { data, error } = await supabase
    .from('newsletter_admin_users')
    .select('id,email,name,role,is_active,created_at,updated_at,last_login_at')
    .order('created_at', { ascending: true });

  if (error) {
    return { ready: false, admins: [] as AdminUser[] };
  }

  return { ready: true, admins: (data as AdminUserRow[]).map(toAdminUser) };
}

export async function verifyAdminCredentials(emailOrUser: string, password: string) {
  const envUser = process.env.ADMIN_DASHBOARD_USER;
  const envPassword = process.env.ADMIN_DASHBOARD_PASSWORD;
  const normalized = normalizeEmail(emailOrUser);

  if (envUser && envPassword && emailOrUser === envUser && password === envPassword) {
    return { ok: true, email: envUser, name: envUser, source: 'env' as const };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false as const };

  const { data, error } = await supabase
    .from('newsletter_admin_users')
    .select('id,email,name,password_hash,is_active')
    .eq('email', normalized)
    .maybeSingle();

  if (error || !data || !data.is_active || !verifyPassword(password, data.password_hash)) {
    return { ok: false as const };
  }

  await supabase
    .from('newsletter_admin_users')
    .update({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', data.id);

  return { ok: true, email: data.email as string, name: data.name as string, source: 'database' as const };
}

export async function upsertAdminUser({
  email,
  name,
  password,
  role = 'admin',
}: {
  email: string;
  name: string;
  password: string;
  role?: 'owner' | 'admin';
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase is not configured.');

  const normalizedEmail = normalizeEmail(email);
  const passwordHash = hashPassword(password);

  const { error } = await supabase.from('newsletter_admin_users').upsert(
    {
      email: normalizedEmail,
      name: name.trim() || normalizedEmail,
      password_hash: passwordHash,
      role,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'email' },
  );

  if (error) throw new Error(error.message);
}

export async function deactivateAdminUser(email: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('newsletter_admin_users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('email', normalizeEmail(email));

  if (error) throw new Error(error.message);
}
