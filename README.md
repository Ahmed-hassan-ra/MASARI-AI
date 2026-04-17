---
title: MASARI-AI Finance
emoji: 💰
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

<div align="center">

# MA$ARI-AI Finance

AI-powered personal finance manager. Track income and expenses, manage budgets, scan receipts with AI OCR, and get personalized financial insights.

</div>

## Features

- **Dashboard** — Real-time balance, income/expense overview, budget progress, recent transactions
- **Income & Expenses** — Add, edit, delete transactions with category breakdowns and monthly analytics
- **Budgets** — Create budgets with category limits, track spending progress, get AI optimization tips
- **Receipt Scanner** — Upload a receipt photo and AI extracts the amount, date, and merchant automatically
- **AI Assistant** — Chat with a financial assistant that has access to your real data and answers specific questions about your spending
- **Reports** — Monthly/quarterly/yearly breakdowns with charts and CSV export
- **Multi-currency** — Supports USD, EUR, GBP, JPY, SAR, AED, EGP, MYR and more
- **Auth** — Google OAuth and email/password login

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL (Supabase)
- **Auth**: NextAuth.js v4 with Prisma adapter, Google OAuth
- **AI**: Groq API — LLaMA 3.3 70B for chat/insights, LLaMA 4 Scout for receipt OCR
- **Deployment**: Docker (Next.js standalone), Hugging Face Spaces

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://USER:PASS@HOST:5432/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASS@HOST:5432/DATABASE"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Groq AI
GROQ_API_KEY="your-groq-api-key"

# Supabase Storage (receipt uploads)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

## Getting Started

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Start dev server
npm run dev
# http://localhost:3000
```

## Project Structure

```
app/                # Next.js pages and API routes
components/         # UI and feature components
lib/                # Auth, database, Groq client, currency context
prisma/             # Database schema
public/             # Static assets
```

## License

MIT
