# ILM Quiz

A gamified Islamic knowledge quiz app — Quran, Hadith, Fiqh, Prophetic Biography, Aqeedah and more — with culturally-grounded rank progression and an AI-powered "Ask the Imam" hint system. Hausa-first, expanding to French, Arabic, and Bahasa Indonesia/Malaysia.

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Backend / Auth / DB:** Supabase (Postgres + Row Level Security)
- **AI:** Google Genkit (`@genkit-ai/googleai`)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # http://localhost:9002
```

### Environment variables

See `.env.local.example`. You will need your Supabase URL + anon key and a Google AI API key for the Genkit flows.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack, port 9002) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check (no emit) |
| `npm run genkit:dev` | Run Genkit flows locally |
| `npm run genkit:watch` | Run Genkit flows in watch mode |

## Content pipeline

AI never publishes content directly. The `draft-questions` flow produces **candidate** questions that land in the `/admin/review` queue as `ai_drafted`. A human reviewer (role `reviewer` or `admin`) must verify every citation and approve each question before it is marked `published` and shown to players. Row Level Security enforces that regular users only ever see `published` rows. See `supabase/migrations/0001_content_review_roles.sql`.

## Project structure

```
src/
  ai/          Genkit config + flows (ask-the-imam, draft-questions)
  app/         Next.js App Router routes
    (app)/     Authenticated app (home, quiz, leaderboard, admin, etc.)
    login/     Auth pages
  components/  UI + game components
  lib/         Supabase clients, constants, types, utils
supabase/
  migrations/  SQL migrations
```
