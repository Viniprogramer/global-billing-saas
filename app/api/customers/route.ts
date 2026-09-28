import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { requireAuth } from '@/src/lib/request-auth';

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Math.min(20, Number(searchParams.get('pageSize') ?? '8'));

  const where = {
    tenantId: auth.tenantId,
    OR: query
      ? [
          { name: { contains: query, mode: 'insensitive' as const } },
          { email: { contains: query, mode: 'insensitive' as const } },
          { company: { contains: query, mode: 'insensitive' as const } },
        ]
      : undefined,
  };

  const [items, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, name: true, email: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.customer.count({ where }),
  ]);

  return NextResponse.json(
    {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = customerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await db.customer.create({
    data: {
      ...parsed.data,
      tenantId: auth.tenantId,
      ownerId: auth.userId,
    },
  });

  await db.activity.create({
    data: {
      type: 'CUSTOMER_CREATED',
      message: `Customer ${customer.name} was created`,
      tenantId: auth.tenantId,
      userId: auth.userId,
      customerId: customer.id,
    },
  });

  return NextResponse.json({ customer }, { status: 201 });
}
