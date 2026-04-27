import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequestAuthorized } from '@/lib/briefing/admin-request';
import { sendBriefingEmail } from '@/lib/briefing/email';
import { publishBriefingPost } from '@/lib/briefing/posts';

const PublishSchema = z.object({
  id: z.uuid(),
  sendEmail: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  try {
    const body = PublishSchema.parse(await request.json());
    const post = await publishBriefingPost(body.id);
    const email = body.sendEmail ? await sendBriefingEmail(post) : { sent: false, reason: 'sendEmail=false' };

    return NextResponse.json({
      ok: true,
      post,
      email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Publish failed.';

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 400 },
    );
  }
}
