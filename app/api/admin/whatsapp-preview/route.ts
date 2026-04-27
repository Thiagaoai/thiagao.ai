import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequestAuthorized } from '@/lib/briefing/admin-request';
import { getDraftBriefings, getPublishedBriefings } from '@/lib/briefing/posts';
import { renderBriefingWhatsApp } from '@/lib/briefing/whatsapp';

export const runtime = 'nodejs';

const PreviewSchema = z.object({
  id: z.uuid(),
});

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = PreviewSchema.parse(await request.json());
    const [drafts, published] = await Promise.all([
      getDraftBriefings({ limit: 50 }),
      getPublishedBriefings({ limit: 50 }),
    ]);
    const post = [...drafts.posts, ...published.posts].find((item) => item.id === body.id);

    if (!post) {
      return NextResponse.json({ ok: false, message: 'Briefing não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      text: renderBriefingWhatsApp(post),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao gerar WhatsApp.';
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
