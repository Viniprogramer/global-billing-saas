import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/src/lib/db';
import { hashPassword, signAuthToken } from '@/src/lib/auth';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  tenantName: z.string().min(2),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, password, tenantName } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const baseSlug = slugify(tenantName);
    const slug = `${baseSlug}-${Math.floor(Math.random() * 9999)}`;

    const passwordHash = await hashPassword(password);

    const result = await db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      await tx.activity.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          type: 'USER_REGISTERED',
          message: `${user.name} registered a new workspace`,
        },
      });

      return { tenant, user };
    });

    const token = signAuthToken({
      userId: result.user.id,
      tenantId: result.tenant.id,
      role: result.user.role,
      email: result.user.email,
    });

    return NextResponse.json({ token, user: result.user, tenant: result.tenant }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected registration error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
