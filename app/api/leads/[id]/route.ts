import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { requireAuth } from '@/src/lib/request-auth';

const updateSchema = z.object({
  title: z.string().min(2),
  value: z.number().positive(),
  customerId: z.string().min(1),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await db.lead.updateMany({
    where: { id, tenantId: auth.tenantId },
    data: {
      title: parsed.data.title,
      value: parsed.data.value,
      customerId: parsed.data.customerId,
    },
  });

  if (!updated.count) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const lead = await db.lead.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  await db.lead.delete({ where: { id } });

  await db.activity.create({
    data: {
      type: 'LEAD_DELETED',
      message: `Lead ${lead.title} was deleted`,
      tenantId: auth.tenantId,
      userId: auth.userId,
      customerId: lead.customerId,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
