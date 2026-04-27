import { NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/briefing/admin-request';
import { getSupabaseAdmin } from '@/lib/briefing/supabase';

export const runtime = 'nodejs';

const BUCKET = 'newsletter-assets';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function safeFileName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || 'newsletter-card.png';
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, message: 'Supabase nao esta configurado.' }, { status: 500 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('card');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: 'Envie uma imagem para o card.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ ok: false, message: 'O arquivo precisa ser uma imagem.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ ok: false, message: 'A imagem precisa ter ate 5 MB.' }, { status: 400 });
  }

  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });

  const extension = file.type.split('/')[1] || 'png';
  const path = `breaking/${Date.now()}-${safeFileName(file.name || `card.${extension}`)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    ok: true,
    url: data.publicUrl,
  });
}
