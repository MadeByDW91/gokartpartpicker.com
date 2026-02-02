# Project Atlas 🏎️

> A production-grade PartPicker-style platform for go-kart enthusiasts.

**Codename:** Project Atlas  
**Target Domain:** GoKartPartPicker.com  
**Status:** 🟡 Planning Complete — Ready for Execution

---

## 🎯 Vision

Build a trusted, builder-first platform where go-kart enthusiasts can:
- Browse engine specifications (Predator 212, 224, 301, 420)
- Explore compatible parts with confidence
- Build custom configurations with real-time compatibility checks
- Access guides, specs, and safety information
- Save and share their builds

### Design Philosophy

- **Dark, utilitarian, garage-built aesthetic**
- **Orange accent on charcoal base**
- **Builder-first UX** — everything serves the build experience
- **Explainability over cleverness** — users understand why things work (or don't)

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS |
| Auth | Supabase Auth |
| Hosting | Vercel |
| Testing | Vitest + Playwright |

---

## 🤖 Agent System

This project uses a multi-agent execution model. Each agent has specific responsibilities:

| Agent | Role |
|-------|------|
| A0: Architect | System design, coordination |
| A1: Database | Schema, migrations, RLS |
| A2: Auth | Authentication, authorization |
| A3: UI | Components, pages, styling |
| A4: Backend | APIs, server actions, validation |
| A5: Admin | Admin dashboard, CRUD |
| A6: Compatibility | Rules engine |
| A7: Content | Guides, documentation |
| A8: QA | Testing, audits |
| A9: DevOps | CI/CD, deployment |

Agent roles: Architect, Database, Auth, UI, Backend, Admin, Compatibility, Content, QA, DevOps.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Vercel account (for deployment)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd gokartpartpicker.com

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Configure Supabase credentials in .env.local

# Run database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Start development server
pnpm dev
```

---

## 📁 Project Structure

```
gokartpartpicker.com/
├── frontend/       # Next.js app (app/, components/, lib/, etc.)
├── scripts/        # Utility scripts
├── supabase/       # Migrations and config
├── Admin/          # Admin/ingestion tooling
├── HOW-TO-RUN-MIGRATIONS.md
└── START-DEV-SERVER.md
```

Frontend lives in `frontend/` (Next.js). Scripts in `scripts/`, Supabase config in `supabase/`.

---

## 🔐 Security

- Row Level Security (RLS) on all tables
- Server-side validation for all mutations
- HTTP-only session cookies
- CSRF protection via Next.js server actions
- Rate limiting on API routes

RLS, server-side validation, and rate limiting are in place.

---

## 📅 Timeline

| Week | Focus | Gate |
|------|-------|------|
| Week 1 | Foundation (Schema, Auth, Design) | Auth flow works |
| Week 2 | Data Layer (Engines, Parts, Admin) | Admin CRUD works |
| Week 3 | Builder (Compatibility, Configurator) | Build saves work |
| Week 4 | Polish (Content, SEO, Deploy) | Production ready |

See root runbooks: HOW-TO-RUN-MIGRATIONS.md, START-DEV-SERVER.md.

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run all tests with coverage
pnpm test:coverage
```

---

## 📝 Contributing

This project uses agent-based development. Before making changes:

1. Identify which agent owns the code you're modifying
2. Follow repo structure and conventions
3. Run linting and type checks before committing
4. Write tests for new functionality

### Commit Convention

```
feat(scope): description
fix(scope): description
chore(scope): description
docs(scope): description
test(scope): description
```

---

## 📜 License

Proprietary — Garage Built Digital LLC

---

## 🏁 Project Status

- [x] Planning documentation complete
- [ ] Project scaffolded
- [ ] Database schema created
- [ ] Auth system implemented
- [ ] Design system built
- [ ] Admin dashboard complete
- [ ] Compatibility engine working
- [ ] Builder functional
- [ ] Content system ready
- [ ] Production deployed

---

*Built with ❤️ by Garage Built Digital LLC*
