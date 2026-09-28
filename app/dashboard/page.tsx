"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Users, KanbanSquare, History, Globe, LogOut, PlusCircle, Search } from 'lucide-react';
import { authedFetch, clearToken, getLocalePreference, getToken, setLocalePreference } from '@/src/lib/client-auth';
import { dictionaries, Locale } from '@/src/lib/i18n';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
};

type DashboardMetrics = {
  totalCustomers: number;
  totalLeads: number;
  proposalLeads: number;
  lostLeads: number;
  winRate: string;
  revenue: string;
};

type Activity = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user?: { name: string };
};

type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string | null;
  notes?: string | null;
  createdAt: string;
};

type Lead = {
  id: string;
  title: string;
  value: number;
  stage: 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
  customerId: string;
  customer: {
    name: string;
    company: string;
  };
};

type Tab = 'dashboard' | 'customers' | 'pipeline' | 'activities';

const stageLabels: Record<Lead['stage'], string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  WON: 'Won',
  LOST: 'Lost',
};

export default function DashboardPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(() => {
    const savedLocale = getLocalePreference();
    return savedLocale === 'pt-BR' ? 'pt-BR' : 'en';
  });
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', company: '', phone: '', notes: '' });
  const [newLead, setNewLead] = useState({ title: '', value: '1000', customerId: '', stage: 'LEAD' as Lead['stage'] });

  const t = dictionaries[locale];

  const groupedLeads = useMemo(() => {
    const groups: Record<Lead['stage'], Lead[]> = {
      LEAD: [],
      QUALIFIED: [],
      PROPOSAL: [],
      WON: [],
      LOST: [],
    };
    leads.forEach((lead) => {
      groups[lead.stage].push(lead);
    });
    return groups;
  }, [leads]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadAllData() {
    setLoading(true);
    setError('');

    try {
      const [meRes, dashboardRes, customersRes, leadsRes, activitiesRes] = await Promise.all([
        authedFetch<{ user: UserProfile }>('/api/auth/me'),
        authedFetch<{ metrics: DashboardMetrics; activities: Activity[] }>('/api/dashboard'),
        authedFetch<{ items: Customer[]; totalPages: number }>(`/api/customers?page=${page}&pageSize=8&query=${encodeURIComponent(query)}`),
        authedFetch<{ leads: Lead[] }>('/api/leads'),
        authedFetch<{ activities: Activity[] }>('/api/activities'),
      ]);

      setProfile(meRes.user);
      setMetrics(dashboardRes.metrics);
      setCustomers(customersRes.items);
      setTotalPages(customersRes.totalPages);
      setLeads(leadsRes.leads);
      setActivities(activitiesRes.activities);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load CRM data');
      if (String(loadError).toLowerCase().includes('unauthorized')) {
        clearToken();
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }

  async function onSearchCustomers() {
    setPage(1);
    await loadAllData();
  }

  async function createCustomer() {
    try {
      await authedFetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(newCustomer),
      });
      setNewCustomer({ name: '', email: '', company: '', phone: '', notes: '' });
      await loadAllData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create customer');
    }
  }

  async function removeCustomer(customerId: string) {
    try {
      await authedFetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      await loadAllData();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Failed to remove customer');
    }
  }

  async function createLead() {
    try {
      await authedFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          title: newLead.title,
          value: Number(newLead.value),
          customerId: newLead.customerId,
          stage: newLead.stage,
        }),
      });
      setNewLead({ title: '', value: '1000', customerId: '', stage: 'LEAD' });
      await loadAllData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create lead');
    }
  }

  async function moveLead(leadId: string, stage: Lead['stage']) {
    try {
      await authedFetch(`/api/leads/${leadId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
      await loadAllData();
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'Failed to move lead');
    }
  }

  function onLogout() {
    clearToken();
    router.replace('/login');
  }

  function onLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    setLocalePreference(nextLocale);
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-950 p-8 text-slate-200">Loading CRM...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-3 text-slate-100 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t.crmTitle}</h1>
              <p className="mt-1 text-sm text-slate-300">{t.crmSubtitle}</p>
              {profile ? (
                <p className="mt-2 text-xs text-cyan-300">
                  {profile.name} ({profile.role}) • {profile.tenant.name}
                </p>
              ) : null}
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                <Globe size={14} />
                <span>{t.language}:</span>
                <button
                  type="button"
                  onClick={() => onLocaleChange('en')}
                  className={`rounded px-2 py-0.5 ${locale === 'en' ? 'bg-cyan-300 text-slate-900' : 'bg-slate-800'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onLocaleChange('pt-BR')}
                  className={`rounded px-2 py-0.5 ${locale === 'pt-BR' ? 'bg-cyan-300 text-slate-900' : 'bg-slate-800'}`}
                >
                  PT-BR
                </button>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:border-slate-500"
              >
                <LogOut size={14} /> {t.logout}
              </button>
            </div>
          </div>
        </header>

        <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
          <button type="button" onClick={() => setActiveTab('dashboard')} className={`rounded-lg px-4 py-3 text-sm font-semibold ${activeTab === 'dashboard' ? 'bg-cyan-300 text-slate-900' : 'border border-slate-700 bg-slate-900'}`}>
            <LayoutGrid className="mr-2 inline h-4 w-4" /> {t.dashboard}
          </button>
          <button type="button" onClick={() => setActiveTab('customers')} className={`rounded-lg px-4 py-3 text-sm font-semibold ${activeTab === 'customers' ? 'bg-cyan-300 text-slate-900' : 'border border-slate-700 bg-slate-900'}`}>
            <Users className="mr-2 inline h-4 w-4" /> {t.customers}
          </button>
          <button type="button" onClick={() => setActiveTab('pipeline')} className={`rounded-lg px-4 py-3 text-sm font-semibold ${activeTab === 'pipeline' ? 'bg-cyan-300 text-slate-900' : 'border border-slate-700 bg-slate-900'}`}>
            <KanbanSquare className="mr-2 inline h-4 w-4" /> {t.pipeline}
          </button>
          <button type="button" onClick={() => setActiveTab('activities')} className={`rounded-lg px-4 py-3 text-sm font-semibold ${activeTab === 'activities' ? 'bg-cyan-300 text-slate-900' : 'border border-slate-700 bg-slate-900'}`}>
            <History className="mr-2 inline h-4 w-4" /> {t.activities}
          </button>
        </nav>

        {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}

        {activeTab === 'dashboard' && metrics ? (
          <section className="grid gap-4 md:grid-cols-3">
            <Card label="Revenue" value={`$${metrics.revenue}`} />
            <Card label="Win rate" value={`${metrics.winRate}%`} />
            <Card label="Active leads" value={String(metrics.totalLeads)} />
            <Card label="Customers" value={String(metrics.totalCustomers)} />
            <Card label="Proposal" value={String(metrics.proposalLeads)} />
            <Card label="Lost leads" value={String(metrics.lostLeads)} />
          </section>
        ) : null}

        {activeTab === 'customers' ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-lg font-bold">Create customer</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input value={newCustomer.name} onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
                <input value={newCustomer.email} onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
                <input value={newCustomer.company} onChange={(e) => setNewCustomer((prev) => ({ ...prev, company: e.target.value }))} placeholder="Company" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
                <input value={newCustomer.phone} onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
                <textarea value={newCustomer.notes} onChange={(e) => setNewCustomer((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 md:col-span-2" rows={3} />
              </div>
              <button type="button" onClick={createCustomer} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-200">
                <PlusCircle size={16} /> Add customer
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-bold">Customer list</h2>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 sm:min-w-64" />
                  <button type="button" onClick={onSearchCustomers} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 hover:border-slate-500">
                    <Search size={14} /> Search
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Company</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-t border-slate-800">
                        <td className="py-3">{customer.name}</td>
                        <td className="py-3">{customer.email}</td>
                        <td className="py-3">{customer.company}</td>
                        <td className="py-3 text-right">
                          <button type="button" onClick={() => removeCustomer(customer.id)} className="rounded bg-rose-500/20 px-2 py-1 text-rose-200 hover:bg-rose-500/30">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center">
                <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40">
                  Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === 'pipeline' ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-lg font-bold">Create lead</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <input value={newLead.title} onChange={(e) => setNewLead((prev) => ({ ...prev, title: e.target.value }))} placeholder="Lead title" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
                <input value={newLead.value} onChange={(e) => setNewLead((prev) => ({ ...prev, value: e.target.value }))} placeholder="Value" type="number" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
                <select value={newLead.customerId} onChange={(e) => setNewLead((prev) => ({ ...prev, customerId: e.target.value }))} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={createLead} className="rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-200">
                  Add lead
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {(Object.keys(stageLabels) as Lead['stage'][]).map((stage) => (
                <div key={stage} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-300">{stageLabels[stage]}</h3>
                  <div className="space-y-2">
                    {groupedLeads[stage].map((lead) => (
                      <article key={lead.id} className="rounded-lg border border-slate-700 bg-slate-950 p-2">
                        <p className="text-sm font-semibold">{lead.title}</p>
                        <p className="text-xs text-slate-400">{lead.customer.name} • ${lead.value.toFixed(0)}</p>
                        <select
                          value={lead.stage}
                          onChange={(e) => moveLead(lead.id, e.target.value as Lead['stage'])}
                          className="mt-2 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                        >
                          {(Object.keys(stageLabels) as Lead['stage'][]).map((targetStage) => (
                            <option key={targetStage} value={targetStage}>
                              {stageLabels[targetStage]}
                            </option>
                          ))}
                        </select>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'activities' ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-lg font-bold">Activity timeline</h2>
            <div className="mt-4 space-y-3">
              {activities.map((activity) => (
                <article key={activity.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <p className="text-sm font-semibold text-white">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {activity.type} • {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </article>
  );
}
