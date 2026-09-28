import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { requireAuth } from '@/src/lib/request-auth';

const stageSchema = z.object({
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = stageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const lead = await db.lead.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const updated = await db.lead.update({
    where: { id },
    data: { stage: parsed.data.stage },
    include: {
      customer: { select: { id: true, name: true, company: true } },
      owner: { select: { id: true, name: true } },
    },
  });

  await db.activity.create({
    data: {
      type: 'LEAD_STAGE_CHANGED',
      message: `Lead ${updated.title} moved to ${updated.stage}`,
      tenantId: auth.tenantId,
      userId: auth.userId,
      leadId: updated.id,
      customerId: updated.customerId,
    },
  });

  return NextResponse.json({ lead: updated }, { status: 200 });
}
