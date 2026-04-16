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

# MA$ARI-AI Finance Final Year Project

AI-powered personal finance manager built with Next.js. Track income and expenses, create budgets, scan receipts with OCR, and get AI insights to optimize your spending and savings.

</div>

## 📖 Description

MA$ARI-AI Finance is a full-featured, AI-assisted personal finance platform that helps you understand, control, and improve your money habits. Built with modern web technologies, it centralizes your income, expenses, budgets, and receipts into a single, cohesive experience. Upload receipts to automatically extract totals, dates, and merchants using OCR. Track spending by category, monitor progress against monthly budgets, and set savings goals with clear visualizations. An integrated AI assistant analyzes trends, flags unusual activity, answers natural-language questions, and provides personalized, actionable recommendations to optimize cash flow and budgeting. Secure authentication, robust data modeling with Prisma, and flexible integrations (OpenAI/Groq, Cloudinary, Google Vision) make it production-ready and easy to extend.

## ✨ Features

- **Dashboard**: Real-time overview, trends, and budget progress
- **Transactions**: Add/edit income and expenses with smart categories
- **Receipts OCR**: Upload receipts, auto-extract totals, dates, merchants
- **Budgets**: Create budgets, monitor progress, get optimization tips
- **AI Assistant**: Natural-language Q&A, insights, and recommendations
- **Reports**: Charts, exports, and monthly summaries
- **Goals & Notifications**: Savings goals and spend alerts
- **Auth & Security**: NextAuth, JWT sessions, Prisma adapter

## 🧰 Tech Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS, Radix UI, shadcn/ui
- Prisma + PostgreSQL/MySQL (via `DATABASE_URL`)
- NextAuth (Credentials + Google OAuth)
- OpenAI/Groq for insights (`ai`, `openai`, `groq-sdk`)
- Tesseract.js and Google Vision (optional) for OCR
- Cloudinary (optional) for image storage
- TanStack Query, Recharts

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL or MySQL
- Optional: OpenAI/Groq API keys, Cloudinary, Google OAuth

### 1) Clone the Repository
```bash
git clone https://github.com/sugapriya-k/Final-Year-
cd Final-Year-
```

### 2) Install Dependencies
```bash
npm install
```

### 3) Configure Environment
Create `.env.local` in the project root:
```env
# Database
DATABASE_URL="postgresql://USER:PASS@localhost:5432/masariai_finance"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
DEEPSEEK_API_KEY="your-deepseek-key"

# Supabase Storage (for receipt image uploads)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 4) Initialize Database
```bash
npx prisma generate
npx prisma db push
# Optional dev UI
npx prisma studio
```

### 5) Start the App
```bash
npm run dev
# http://localhost:3000
```

## 🗂️ Project Structure
```text
app/                # Next.js routes (pages, api)
components/         # Reusable UI and feature components
lib/                # Auth, db, and utilities
prisma/             # Prisma schema and migrations
public/             # Static assets (uploads/receipts supported)
diagrams/           # PlantUML architecture diagrams
```

## 🔐 Authentication
- `next-auth` with Prisma adapter and JWT sessions
- Providers: Credentials, Google OAuth (`GOOGLE_CLIENT_ID/SECRET`)

## 🧾 OCR Receipts
- Built-in OCR via Tesseract.js; optional Google Vision for higher accuracy
- See `OCR_SETUP_GUIDE.md` for Google Vision setup and best practices
- Images can be stored locally (`public/uploads/receipts`) or via Cloudinary

## 📊 Scripts
```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Lint
```

## ⚙️ Configuration Notes
- `next.config.mjs` ignores build-time ESLint/TS errors in CI-like flows
- Images are unoptimized by default (adjust for production/CDN)

## 🧪 Troubleshooting
- Prisma client issues: `npx prisma generate`
- Next.js cache: `rm -rf .next && npm run build`
- OCR accuracy: check lighting, resolution; consider Google Vision

## 📄 License
This project is licensed under the [MIT License](./LICENSE) — see the LICENSE file for details.

—
