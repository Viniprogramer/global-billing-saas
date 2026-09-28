import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { requireAuth } from '@/src/lib/request-auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [totalCustomers, totalLeads, wonLeads, lostLeads, proposalLeads, activities] = await Promise.all([
    db.customer.count({ where: { tenantId: auth.tenantId } }),
    db.lead.count({ where: { tenantId: auth.tenantId } }),
    db.lead.findMany({ where: { tenantId: auth.tenantId, stage: 'WON' }, select: { value: true } }),
    db.lead.count({ where: { tenantId: auth.tenantId, stage: 'LOST' } }),
    db.lead.count({ where: { tenantId: auth.tenantId, stage: 'PROPOSAL' } }),
    db.activity.findMany({ where: { tenantId: auth.tenantId }, orderBy: { createdAt: 'desc' }, take: 6 }),
  ]);

  const revenue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);

  return NextResponse.json(
    {
      metrics: {
        totalCustomers,
        totalLeads,
        proposalLeads,
        lostLeads,
        winRate: totalLeads ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : '0.0',
        revenue: revenue.toFixed(2),
      },
      activities,
    },
    { status: 200 }
  );
}
