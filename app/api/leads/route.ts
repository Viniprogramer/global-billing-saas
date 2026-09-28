import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { requireAuth } from '@/src/lib/request-auth';

const leadSchema = z.object({
  title: z.string().min(2),
  value: z.number().positive(),
  customerId: z.string().min(1),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']).optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leads = await db.lead.findMany({
    where: { tenantId: auth.tenantId },
    include: {
      customer: { select: { id: true, name: true, company: true } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ leads }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  const lead = await db.lead.create({
    data: {
      title: payload.title,
      value: payload.value,
      stage: payload.stage ?? 'LEAD',
      customerId: payload.customerId,
      tenantId: auth.tenantId,
      ownerId: auth.userId,
    },
    include: {
      customer: { select: { id: true, name: true, company: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  await db.activity.create({
    data: {
      type: 'LEAD_CREATED',
      message: `Lead ${lead.title} was created`,
      tenantId: auth.tenantId,
      userId: auth.userId,
      leadId: lead.id,
      customerId: lead.customerId,
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
