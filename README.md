# AddaDotCom — Cafe & Restaurant Management System

> Production-grade Café & Restaurant Management System built with Next.js 14 App Router, PostgreSQL (Prisma ORM), and Real-Time Server-Sent Events (SSE).

Live Application: [https://addadotcom.vercel.app](https://addadotcom.vercel.app)

---

## 📚 Complete Project Documentation

All project documentation is centrally organized in the [`/docs`](docs/) directory.

| Document | Description |
|----------|-------------|
| 🧠 **[AgentContext.md](docs/AgentContext.md)** | Authoritative guide & AI brain context (Read first) |
| 📏 **[Rules.md](docs/Rules.md)** | Non-negotiable coding standards, forbidden/preferred libraries |
| 🏗️ **[Architecture.md](docs/Architecture.md)** | System design, folder structure, sequence diagrams & ERD |
| 📋 **[PRD.md](docs/PRD.md)** | Product Requirements Document, business logic & user stories |
| 🎨 **[Design.md](docs/Design.md)** | Design system, tokens, typography, animations & components |
| 🗺️ **[Phases.md](docs/Phases.md)** | 13-Phase project implementation roadmap & status |
| 📝 **[Memory.md](docs/Memory.md)** | Append-only developer journal, session history & key decisions |
| 🔌 **[API.md](docs/API.md)** | Full API endpoint specification and route reference |
| 🗄️ **[Database.md](docs/Database.md)** | Database schema, models, JSON structures & enums |
| 🔒 **[Security.md](docs/Security.md)** | NextAuth RBAC, JWT claims & data protection rules |
| ⚡ **[Performance.md](docs/Performance.md)** | App router, SSE, animation & query optimization rules |
| 🧪 **[Testing.md](docs/Testing.md)** | Unit, API integration & Puppeteer E2E test suites |
| 🚀 **[Deployment.md](docs/Deployment.md)** | Vercel & Neon PostgreSQL production deployment guide |
| 🛣️ **[Roadmap.md](docs/Roadmap.md)** | Feature backlog & long-term development roadmap |
| 🧩 **[Components.md](docs/Components.md)** | Reusable UI component registry & props reference |
| 📜 **[Changelog.md](docs/Changelog.md)** | Version changelog following Keep a Changelog standard |
| 🛠️ **[DeveloperGuide.md](docs/DeveloperGuide.md)** | Local environment setup & quick-start manual |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local

# 3. Setup database schema & seed initial data
npx prisma db push
npm run db:seed
npm run db:seed-automations

# 4. Start local development server
npm run dev
```

Admin credentials: `admin@addadotcom.cafe` / `admin123`
