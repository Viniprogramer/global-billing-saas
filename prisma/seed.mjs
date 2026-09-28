import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing for seed execution.');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const workspaceSlug = 'northstar-demo';
  const adminEmail = 'demo@northstarcrm.com';
  const memberEmail = 'sales@northstarcrm.com';

  const passwordHash = await bcrypt.hash('Demo1234!', 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: workspaceSlug },
    update: { name: 'Northstar CRM Demo' },
    create: {
      name: 'Northstar CRM Demo',
      slug: workspaceSlug,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Demo Admin',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
    create: {
      name: 'Demo Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: memberEmail },
    update: {
      name: 'Sales Member',
      passwordHash,
      role: 'MEMBER',
      tenantId: tenant.id,
    },
    create: {
      name: 'Sales Member',
      email: memberEmail,
      passwordHash,
      role: 'MEMBER',
      tenantId: tenant.id,
    },
  });

  const customerSeed = [
    { name: 'Acme Labs', email: 'billing@acmelabs.io', company: 'Acme Labs' },
    { name: 'Delta Commerce', email: 'ops@deltacommerce.com', company: 'Delta Commerce' },
    { name: 'Pixel Partners', email: 'hello@pixelpartners.co', company: 'Pixel Partners' },
    { name: 'Blue Orbit', email: 'accounts@blueorbit.ai', company: 'Blue Orbit' },
    { name: 'SaaS Foundry', email: 'finance@saasfoundry.dev', company: 'SaaS Foundry' },
  ];

  const customers = [];
  for (const item of customerSeed) {
    const customer = await prisma.customer.upsert({
      where: { id: `${tenant.id}-${item.email}` },
      update: {
        name: item.name,
        company: item.company,
        ownerId: admin.id,
        tenantId: tenant.id,
      },
      create: {
        id: `${tenant.id}-${item.email}`,
        name: item.name,
        email: item.email,
        company: item.company,
        ownerId: admin.id,
        tenantId: tenant.id,
      },
    });
    customers.push(customer);
  }

  const leadSeed = [
    { title: 'Starter Annual Contract', value: 1800, stage: 'LEAD' },
    { title: 'Pro Migration Package', value: 5200, stage: 'QUALIFIED' },
    { title: 'Enterprise Expansion', value: 12400, stage: 'PROPOSAL' },
    { title: 'Renewal Upsell', value: 7600, stage: 'WON' },
    { title: 'Competitive Replacement', value: 4300, stage: 'LOST' },
  ];

  for (let i = 0; i < leadSeed.length; i += 1) {
    const item = leadSeed[i];
    const customer = customers[i % customers.length];

    await prisma.lead.upsert({
      where: { id: `${tenant.id}-lead-${i + 1}` },
      update: {
        title: item.title,
        value: item.value,
        stage: item.stage,
        customerId: customer.id,
        ownerId: i % 2 === 0 ? admin.id : member.id,
        tenantId: tenant.id,
      },
      create: {
        id: `${tenant.id}-lead-${i + 1}`,
        title: item.title,
        value: item.value,
        stage: item.stage,
        customerId: customer.id,
        ownerId: i % 2 === 0 ? admin.id : member.id,
        tenantId: tenant.id,
      },
    });
  }

  await prisma.activity.create({
    data: {
      tenantId: tenant.id,
      userId: admin.id,
      type: 'USER_REGISTERED',
      message: 'Demo workspace seeded successfully',
    },
  });

  console.log('Seed completed');
  console.log('Demo login:', adminEmail);
  console.log('Demo password: Demo1234!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
