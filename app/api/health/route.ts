export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    ok: true,
    service: 'thigaoai-site',
    timestamp: new Date('2026-04-24T00:00:00.000Z').toISOString(),
  });
}
