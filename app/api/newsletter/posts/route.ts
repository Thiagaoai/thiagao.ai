import { NextResponse } from 'next/server';
import { getPublishedBriefings } from '@/lib/briefing/posts';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tag = url.searchParams.get('tag') ?? undefined;
  const limit = Number(url.searchParams.get('limit') ?? 12);
  const { posts, source } = await getPublishedBriefings({
    tag,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 24) : 12,
  });

  return NextResponse.json({
    ok: true,
    source,
    posts,
  });
}
