import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { requireAuth } from '@/src/lib/request-auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activities = await db.activity.findMany({
    where: { tenantId: auth.tenantId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, name: true } },
      lead: { select: { id: true, title: true, stage: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ activities }, { status: 200 });
}
