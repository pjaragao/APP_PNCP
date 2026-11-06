<div align="center">

# 📑 PNCP Insight

### SaaS for B2B companies that sell to the Brazilian government

*Smart search and AI analysis of public tender notices from the national procurement portal (PNCP).*

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini-8E75B2?logo=googlegemini&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-billing-635BFF?logo=stripe&logoColor=white)

</div>

---

## What is it?

PNCP Insight streamlines the journey of companies that bid on public contracts: it **syncs tenders from the PNCP API**,
lets users **search them intelligently**, and uses **Gemini to analyze each notice** (fit, requirements, risks) so the team reads
the right documents first.

## ✨ Implemented

- [x] Marketing landing page
- [x] Authentication (Supabase SSR)
- [x] Scheduled synchronization with the PNCP API (cron API routes)
- [x] Admin monitoring dashboard
- [x] Smart tender search
- [x] AI analysis of tender documents (Gemini)
- [x] Subscription billing (Stripe)

## 🏗️ Stack and structure

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), mobile-first UI |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data | Supabase (PostgreSQL) + Prisma ORM |
| AI | Google Gemini Pro / Flash |
| Payments | Stripe |

```text
src/app/          routes, layouts and API routes (including crons)
src/services/     business logic: PNCP, AI, billing, sync
src/components/   UI components and layouts
src/lib/          Supabase and Prisma clients
prisma/           schema and migrations
PLAN/             strategy and technical documentation
```

## 🚀 Run it

```bash
git clone https://github.com/pjaragao/APP_PNCP.git && cd APP_PNCP
cp .env.example .env      # fill in Supabase, Gemini and Stripe keys
npm install
npx prisma migrate dev
npm run dev               # http://localhost:3000
```

Or with Docker (app + Supabase-compatible Postgres on `pncp-db`):

```bash
docker compose up -d --build
```

---

<div align="center">

Built by **Paulo Aragão Jr** · [GitHub](https://github.com/pjaragao) · related earlier project: [pesquisa_licitacoes](https://github.com/pjaragao/pesquisa_licitacoes)

</div>
