# Vercel Deploy Checklist (Upwork Portfolio)

## 1) Prepare local project

1. `cp .env.example .env`
2. Add real values for `DATABASE_URL` and `JWT_SECRET`
3. Run `npm install`
4. Run `npx prisma generate`
5. Run `npm run db:migrate`
6. Run `npm run db:seed`
7. Run `npm run dev` and verify:
- `/`
- `/login`
- `/dashboard`

## 2) Create PostgreSQL production database

Use Neon, Supabase, Railway, or Render PostgreSQL.

Required env:
- `DATABASE_URL`
- `JWT_SECRET`

Optional (webhook demo only):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 3) Deploy to Vercel

1. Push repository to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set install command: `npm install`
5. Configure environment variables
6. Deploy

## 4) Run production database setup

After first deploy:

1. Open project terminal locally
2. Point `.env` to production `DATABASE_URL`
3. Run `npm run db:migrate`
4. Run `npm run db:seed`

## 5) Portfolio test script for clients

Send this to prospects:

1. Open deployed URL
2. Click Login
3. Use demo credentials
- Email: `demo@northstarcrm.com`
- Password: `Demo1234!`
4. Open Customers tab and add a customer
5. Open Pipeline tab and move lead stages
6. Switch language EN/PT-BR in header
7. Open Activities tab and review timeline

## 6) Upwork profile assets

- Add 3 screenshots: dashboard, customers, kanban
- Add 1 short Loom video (2-3 min)
- Add project summary with stack and business outcomes
