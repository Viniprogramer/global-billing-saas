import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { requireAuth } from '@/src/lib/request-auth';

const updateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  phone: z.string().optional(),
  notes: z.string().optional(),
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

  const customer = await db.customer.updateMany({
    where: { id, tenantId: auth.tenantId },
    data: parsed.data,
  });

  if (!customer.count) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  await db.activity.create({
    data: {
      type: 'CUSTOMER_UPDATED',
      message: `Customer profile was updated`,
      tenantId: auth.tenantId,
      userId: auth.userId,
      customerId: id,
    },
  });

  const updated = await db.customer.findUnique({ where: { id } });
  return NextResponse.json({ customer: updated }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const customer = await db.customer.findFirst({
    where: { id, tenantId: auth.tenantId },
  });

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  await db.customer.delete({ where: { id } });

  await db.activity.create({
    data: {
      type: 'CUSTOMER_DELETED',
      message: `Customer ${customer.name} was deleted`,
      tenantId: auth.tenantId,
      userId: auth.userId,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
