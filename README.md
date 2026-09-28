# Sales CRM Portfolio Project

Complete CRM built for portfolio and Upwork applications using React (Next.js), Node runtime API routes, PostgreSQL, and Prisma.

## Implemented features

- Login and registration
- JWT authentication
- User roles (ADMIN and MEMBER)
- Dashboard with key sales metrics
- Customer CRUD
- Leads CRUD
- Kanban pipeline with stage transitions
- Search and filters
- Pagination for customers
- Activity history timeline
- REST API endpoints
- PostgreSQL + Prisma schema
- Responsive UI
- Language switcher (English default + Portuguese-BR)

## Tech stack

- Next.js 16 + TypeScript
- Prisma 7
- PostgreSQL
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Validation (`zod`)
- Tailwind CSS

## Environment variables

Use [.env.example](.env.example):

- DATABASE_URL
- JWT_SECRET
- STRIPE_SECRET_KEY (optional for webhook demo)
- STRIPE_WEBHOOK_SECRET (optional for webhook demo)

## Run locally

1. Install dependencies

```bash
npm install
```

2. Configure env

```bash
cp .env.example .env
```

3. Generate Prisma client

```bash
npx prisma generate
```

4. Run database migration

```bash
npm run db:migrate
```

5. Seed demo data

```bash
npm run db:seed
```

6. Run dev server

```bash
npm run dev
```

## Demo credentials

- Email: demo@northstarcrm.com
- Password: Demo1234!

## Main routes

- Landing: / 
- Login: /login
- Register: /register
- CRM app: /dashboard

## API routes

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET, POST /api/customers
- PUT, DELETE /api/customers/:id
- GET, POST /api/leads
- PUT, DELETE /api/leads/:id
- PATCH /api/leads/:id/stage
- GET /api/dashboard
- GET /api/activities

## Notes for portfolio presentation

- Default language is English
- In-app language switch allows Portuguese-BR
- Login required to access the CRM dashboard
- JWT token is stored client-side for demo simplicity

## Deploy checklist

Detailed deployment steps for Vercel and client testing:

- [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)
