# AI Website Builder

A full-stack app to generate and manage AI-powered websites. This repo contains a React + Vite frontend (`Client/`) and an Express + TypeScript backend (`Server/`) with Prisma for the database.

## 🚀 Quick start

Prerequisites:
- Node.js 18+ (recommended)
- PostgreSQL (or a compatible DATABASE_URL)
- npm, yarn or pnpm

From project root:

1. Start the server

```bash
cd Server
npm install
# create a .env file (see Environment variables below)
npm run dev
```

2. Start the client (in a separate terminal)

```bash
cd Client
npm install
npm run dev
```

Open the app at the Vite dev server (usually http://localhost:5173). Backend runs at http://localhost:3000 by default.

---

## 🔧 Environment variables (Server)
Create a `.env` file in `Server/` with at least the following values:

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
TRUSTED_ORIGINS=http://localhost:5173
BETTER_AUTH_URL=<auth-service-url>
BETTER_AUTH_SECRET=<auth-secret>
AI_API_KEY=<openai-or-ai-provider-key>
STRIPE_SECRET_KEY=<stripe-secret>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
```

Client can optionally set `VITE_BASEURL` to point to your API (defaults to `http://localhost:3000`).

---

## 🗃️ Database / Prisma
Post-install generates Prisma client. To run migrations locally:

```bash
cd Server
npx prisma migrate dev --name init
```

To open Prisma Studio:

```bash
npx prisma studio
```

---

## 🧭 Project Structure

- Client/ — React + Vite frontend
  - src/ — app source
- Server/ — Express + TypeScript backend
  - prisma/ — schema & migrations
  - routes/, controllers/, libs/

---

## 🧪 Scripts

- Client:
  - `npm run dev` — start Vite dev server
  - `npm run build` — build frontend
- Server:
  - `npm run dev` — start server with nodemon
  - `npm start` — run built server

---

## Contributing
Feel free to open issues or PRs. If you'd like, I can add a template for issues/PRs, CI workflows, or more detailed developer setup.

---

If you'd like, I can add badges (CI, coverage), or expand sections (deployment, testing, infra).