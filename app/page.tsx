import { ArrowRight, CheckCircle2, Globe2, ShieldCheck, WalletCards } from 'lucide-react';
import Link from 'next/link';

const highlights = [
  'JWT authentication with role-based user control',
  'Customers and leads CRUD with search and pagination',
  'Kanban pipeline for sales stage transitions',
  'Activity timeline and REST API with Prisma + PostgreSQL',
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      <section className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-14 pt-16 md:px-10 md:pt-24">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          <Globe2 size={14} /> Portfolio Build
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              Sales CRM
              <span className="block bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200 bg-clip-text text-transparent">
                Fullstack Portfolio Project
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
              Complete sales CRM demo built with React + Node runtime APIs + PostgreSQL via Prisma.
              Includes JWT auth, dashboard metrics, customer management, Kanban pipeline, and activity logs.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-cyan-200"
              >
                Open CRM <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Login Demo Account
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Core Stack</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">Next.js 16</div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">TypeScript</div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">Prisma 7</div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">JWT REST API</div>
            </div>
            <div className="mt-5 rounded-lg border border-emerald-400/25 bg-emerald-500/10 p-3 text-xs text-emerald-200">
              Ready to demonstrate end-to-end CRM flows in client interviews.
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {highlights.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
              <span className="text-sm text-slate-200">{item}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <ShieldCheck className="h-5 w-5 text-amber-200" />
            <h3 className="mt-3 text-base font-semibold text-white">Secure Auth</h3>
            <p className="mt-2 text-sm text-slate-300">JWT login/register, hashed passwords, and role-aware APIs.</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <WalletCards className="h-5 w-5 text-cyan-200" />
            <h3 className="mt-3 text-base font-semibold text-white">Sales Pipeline</h3>
            <p className="mt-2 text-sm text-slate-300">Kanban lead stages with customer-linked opportunities.</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <Globe2 className="h-5 w-5 text-emerald-200" />
            <h3 className="mt-3 text-base font-semibold text-white">Portfolio Ready</h3>
            <p className="mt-2 text-sm text-slate-300">Responsive UI with English default and Portuguese-BR toggle.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
