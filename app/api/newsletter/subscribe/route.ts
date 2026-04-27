import { NextResponse } from 'next/server';
import { z } from 'zod';
import { subscribeToBriefing } from '@/lib/briefing/posts';

const SubscribeSchema = z.object({
  email: z.email(),
  source: z.string().min(1).max(80).optional(),
});

export async function POST(request: Request) {
  try {
    const body = SubscribeSchema.parse(await request.json());
    const result = await subscribeToBriefing(body);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 400 },
    );
  }
}
