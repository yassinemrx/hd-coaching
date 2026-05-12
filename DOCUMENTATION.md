# HD Coaching — Full Documentation

This document explains what the website does, who uses it, every page, every feature, the database, the technology, and how it is deployed. It is written so a non-technical owner can understand it and also so a new developer can pick up the project.

---

## 1. What HD Coaching is

HD Coaching is a private fitness-coaching platform. It lets one **coach** manage many **clients** in one place: assign each client a personalized **training program** and **diet plan**, follow their **weight / measurements / photos** over time, and keep everything organised through a shared **exercise library** and **food library**.

It is a normal website that runs on a server. Clients open it on their phone or computer, log in with their email + password, and see only their own plans and progress. The coach sees everyone.

There is **no public sign-up**. Only the coach can create client accounts. This keeps the platform private and avoids spam.

---

## 2. Who uses it (user roles)

There are exactly two kinds of accounts:

| Role | Who it is | What they can do |
| --- | --- | --- |
| **ADMIN** | The coach (you) | Create / edit / delete clients, build training programs and diet plans, manage the exercise and food libraries, change own password |
| **USER** | A client of the coach | Log own weight / measurements / progress photos, view the training program and diet plan assigned by the coach, change own password, switch language |

A client never sees other clients. A client cannot create another client or change their own plans — only log progress.

---

## 3. Languages

The site is fully translated into **3 languages**:

- **English (en)** — default
- **Arabic (ar)** — right-to-left layout (RTL) is automatically applied
- **French (fr)**

The language is chosen with the small globe button in the header / sidebar. The choice is saved in a cookie so the user keeps the same language between sessions. The translation dictionary lives in `src/lib/i18n/dict.ts` (over 1,000 lines of translations across all pages).

Seeded data (exercise names, food names, categories, units, muscle groups, equipment) is **translated at display time** by lookup maps in `src/lib/i18n/dynamic.ts`. So "Barbell Bench Press" automatically shows as "تمرين بنش بالبار" in Arabic and "Développé couché à la barre" in French, even though only the English name is stored in the database.

---

## 4. Pages, screen by screen

### 4.1 Public pages (no login needed)

- **`/`** — Landing page. Hero, features list, "how it works", final call-to-action. Anyone arriving on the domain sees this. Sign-in button at top-right.
- **`/login`** — Client sign-in form.
- **`/admin/login`** — Coach sign-in form (separate URL for branding clarity — same form under the hood).

### 4.2 Client portal (after a client signs in)

URL prefix: `/dashboard`

- **`/dashboard/progress`** — Main client page. Three sections in order:
  - **Weight** — Log today's weight; chart of last 90 days (recharts line chart); table of recent entries with delete buttons.
  - **Measurements** — Log chest / waist / hips / thighs / arms (any combination); list of last 20 entries.
  - **Photos** — Upload a progress photo for a week label; gallery of last 24 photos.
- **`/dashboard/diet`** — Shows the diet plan the coach built for them: daily macro targets, every meal with foods, quantities, per-item and per-meal macro totals.
- **`/dashboard/training`** — Shows the training program: each day as an expandable card with the list of exercises, target sets / reps / rest / notes.
- **`/dashboard/settings`** — Change own password.

### 4.3 Coach panel (after the coach signs in)

URL prefix: `/admin`. Layout: dark sidebar on desktop, hamburger drawer on mobile.

- **`/admin`** — Overview dashboard. Shows stat cards (total clients, logs in last 7 days, photos in last 7 days, library items), recent clients list, and quick action buttons.
- **`/admin/clients`** — All clients as cards. Each card shows last login, last weight log, and edit / delete buttons.
- **`/admin/clients/new`** — Form to create a new client (name + email + initial password).
- **`/admin/clients/[id]`** — One client's profile: their 90-day weight chart, last 12 measurements, last 12 photos, plus three big action buttons:
  - **Edit account** → change name / email / password
  - **Edit diet plan** → opens the diet editor
  - **Edit training program** → opens the training editor
- **`/admin/clients/[id]/edit`** — Edit the client's name, email, and (optionally) set a new password.
- **`/admin/clients/[id]/diet`** — Diet editor (see section 5.2).
- **`/admin/clients/[id]/training`** — Training editor (see section 5.1).
- **`/admin/exercises`** — Exercise library: searchable, filterable by category. Add / edit / delete exercises. ~140 exercises seeded.
- **`/admin/foods`** — Food library: same structure. Add / edit / delete foods with full macros per amount.
- **`/admin/settings`** — Coach's own account: change name / email + change password.

---

## 5. The two main editors

### 5.1 Training program editor

For each client the coach can save **one training program**. A program has:

- A **title** (e.g., "Push / Pull / Legs — Month 1")
- An optional **start date**
- An optional **coach note**
- A list of **days** — each day has a label (e.g., "Push Day A", "Day 1") and a list of **exercises**
- Each exercise has: name, sets, reps, rest, notes, and an optional link to the exercise library (chip says "From library" if so, or "Custom" if free-typed)

Inside the editor the coach can:
- Reorder days (up / down arrows)
- Remove a day
- Add new days
- Click **"+ Add exercise from library"** to open a searchable picker (search by name, muscle group, equipment; filter by category)
- The picker auto-fills sets / reps / rest from the library defaults; coach can override per-exercise
- Reorder or delete individual exercises
- A floating **Save program** button at the bottom of the screen submits everything in one go

### 5.2 Diet plan editor

For each client the coach can save **one diet plan**. A plan has:

- A **title** and optional **coach note**
- **Daily macro targets** (calories, protein, carbs, fat)
- A **plan-total panel** that automatically sums every macro across every meal item and shows a progress bar vs. the target (turns red if over target)
- A list of **meals** — each meal has a name (Breakfast / Lunch / Snack…), time, optional note, and a list of **items**
- Each item references a **food from the library** with a quantity; the editor recalculates macros live based on the food's `perAmount` and the quantity entered

Workflow:
- Click **"+ Add food from library"** → opens a food picker (search + category filter)
- Pick a food → confirm the quantity → it's added to the meal with live macro contribution
- Reorder, delete, or adjust quantity inline
- A floating **Save plan** button submits everything

---

## 6. Database structure

The database is **MySQL** in production (the schema also works with SQLite for local dev — adjust `provider` in `prisma/schema.prisma`). All data is accessed through **Prisma ORM**.

### 6.1 Tables (models)

```
User
├── id, name, email, passwordHash, role (ADMIN | USER), createdAt, lastLoginAt
├── weightLogs (1-to-many)        ← WeightLog
├── measurements (1-to-many)      ← BodyMeasurement
├── photos (1-to-many)            ← ProgressPhoto
├── dietPlan (1-to-1)             ← DietPlan
└── trainingProgram (1-to-1)      ← TrainingProgram

WeightLog        — id, userId, date, weightKg
BodyMeasurement  — id, userId, date, chest?, waist?, hips?, thighs?, arms?
ProgressPhoto    — id, userId, weekLabel, photoUrl, createdAt

ExerciseLibrary  — id, name, category, muscleGroup?, equipment?, notes?, defaultSets, defaultReps, defaultRest
Food             — id, name, category, unit, perAmount, calories, protein, carbs, fat, notes?

DietPlan
├── id, userId (unique), title, notes?
├── macros (1-to-1)               ← MacroTarget (calories, protein, carbs, fat)
└── meals (1-to-many)             ← Meal
    └── items (1-to-many)         ← MealItem (links to Food)

TrainingProgram
├── id, userId (unique), title, notes?, startDate?
└── days (1-to-many)              ← TrainingDay
    └── exercises (1-to-many)     ← Exercise (links optionally to ExerciseLibrary)
```

### 6.2 Cascade rules

- Delete a client → all their weight logs, measurements, photos, diet plan (and its meals + items), training program (and its days + exercises) are deleted automatically.
- Delete a food → its references in meal items become custom items (the foodId becomes null, customName preserved).
- Delete an exercise from library → linked exercises in programs keep their name (libraryId becomes null).

---

## 7. Files uploaded by clients (progress photos)

Photos are stored on the server's filesystem under `public/uploads/` and served through the API route `/api/uploads/[filename]`. They are **not** stored in the database — the database only saves the URL. The server validates that the file is a real image before saving it. Each user can only access their own photos via the dashboard.

---

## 8. API routes (the "back-end")

The site uses **Next.js App Router** API routes. All of them check the session via NextAuth and return 401 if the user is not logged in. Coach-only routes additionally check that `role === "ADMIN"`.

| Endpoint | Methods | Who | What it does |
| --- | --- | --- | --- |
| `/api/auth/[...nextauth]` | GET/POST | anyone | Sign-in / sign-out / session refresh |
| `/api/account/password` | PATCH | self | Change own password |
| `/api/weight` | POST | client | Log a new weight entry |
| `/api/weight/[id]` | DELETE | owner | Delete a weight entry |
| `/api/measurements` | POST | client | Log a measurement |
| `/api/measurements/[id]` | DELETE | owner | Delete a measurement |
| `/api/photos` | POST | client | Upload a progress photo (multipart) |
| `/api/photos/[id]` | DELETE | owner | Delete a photo |
| `/api/uploads/[filename]` | GET | owner / coach | Serve an uploaded image |
| `/api/clients` | POST | coach | Create a client account |
| `/api/clients/[id]` | PATCH / DELETE | coach | Edit / delete a client |
| `/api/clients/[id]/diet` | PUT | coach | Save the full diet plan in one call |
| `/api/clients/[id]/training` | PUT | coach | Save the full training program in one call |
| `/api/exercises` | POST | coach | Create exercise library item |
| `/api/exercises/[id]` | PATCH / DELETE | coach | Edit / delete an exercise |
| `/api/foods` | POST | coach | Create food library item |
| `/api/foods/[id]` | PATCH / DELETE | coach | Edit / delete a food |

---

## 9. Authentication & security

- **Login** uses **NextAuth** with a credentials provider (email + password). Passwords are hashed with **bcrypt** before being stored — the database never sees plaintext passwords.
- The session is a signed JWT cookie. `NEXTAUTH_SECRET` in `.env` is the signing key — must be long and random in production.
- Every API route re-validates the session server-side. Coach-only routes call a `requireAdmin()` helper.
- Every page in `/dashboard` calls `requireClient()` (server-side redirect to `/login` if the visitor is not logged in or is the coach).
- Every page in `/admin` calls `requireAdmin()`.
- The `/admin/login` URL lives in a Next.js route group (`src/app/admin/login/`) that bypasses the `/admin/(dashboard)/layout.tsx` admin layout — this avoids an infinite redirect loop where the auth check would send a logged-out user from `/admin/login` back to `/admin/login`.

---

## 10. Technology stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 14** (App Router) | Server-rendered pages + API routes in one project |
| Language | **TypeScript** | Catches typos and wrong shapes before deploy |
| Database | **MySQL** (prod), SQLite supported (dev) | Hosted on CloudPanel; small enough for many years of single-coach usage |
| ORM | **Prisma** | Type-safe queries, simple migrations |
| Auth | **NextAuth (Credentials)** | Email/password only, no third-party logins |
| Styling | **Tailwind CSS 3** | Utility-first, custom tokens for the black + gold theme |
| Charts | **Recharts** | Weight chart |
| Forms | **React Hook Form** + **Zod** | Validation on client and server |
| Photo storage | **Local filesystem** under `public/uploads` | No S3/Cloudinary cost, photos rarely exceed a few MB each |
| Process manager (prod) | **PM2** | Keeps the Node server running across reboots |
| Host | **CloudPanel on Ubuntu** | Path on server: `/home/hdcoachingnaty/htdocs/hdcoachingnaty.com` |

---

## 11. Project file structure (top level)

```
src/
├── app/
│   ├── page.tsx                       — Public landing page
│   ├── login/                         — Client login
│   ├── admin/
│   │   ├── login/                     — Coach login (outside auth layout)
│   │   └── (dashboard)/               — Coach app (route group; requires ADMIN)
│   │       ├── layout.tsx             — Sidebar + main shell
│   │       ├── page.tsx               — Overview
│   │       ├── clients/               — List, create, view, edit, diet, training
│   │       ├── exercises/             — Exercise library page
│   │       ├── foods/                 — Food library page
│   │       └── settings/              — Coach account settings
│   ├── dashboard/                     — Client app (requires USER)
│   │   ├── layout.tsx                 — Top nav shell
│   │   ├── progress/                  — Weight / measurements / photos
│   │   ├── diet/                      — Read-only diet plan
│   │   ├── training/                  — Read-only training program
│   │   └── settings/                  — Client account settings
│   ├── api/                           — All server endpoints (see section 8)
│   └── globals.css                    — Tailwind layers + dark theme overrides
├── components/                        — Shared UI (AdminSidebar, WeightChart, Icon, LocaleSwitcher, …)
└── lib/
    ├── prisma.ts                      — Prisma client singleton
    ├── session.ts                     — requireAdmin / requireClient helpers
    ├── auth.ts                        — NextAuth options
    ├── week.ts                        — Date / week helpers
    └── i18n/                          — Translation dict + helpers + dynamic name maps

prisma/
├── schema.prisma                      — All database tables
└── seed.ts                            — Seeds admin + demo client + ~140 exercises + ~70 foods

public/
└── uploads/                           — Progress photos (created at runtime)

scripts/
└── migrate-photo-urls.ts              — One-off script to fix old /uploads URLs to /api/uploads/
```

---

## 12. Design system (black + gold theme)

The whole site uses a **luxury dark theme** customised in `tailwind.config.ts` and `src/app/globals.css`:

- Page background: near-black `#0a0a0a`
- Card surface: `#171717` (re-purposed from Tailwind's `bg-white` class so all existing cards turn dark automatically)
- Primary text: off-white `#fafafa`
- Muted text: gray `#a3a3a3`
- Borders: very dark gray `#2e2e2e`
- Accent (gold): `#d4af37` with a brighter `#f0c649` for hover and a darker `#9c7322` at the bottom of the gradient
- Primary button: gold linear gradient with a soft gold glow on hover
- Danger button: saturated red `#ef4444` with white text
- Sidebar: black-to-darker-black gradient with white text; active nav item highlighted gold

Status colors (red / green / blue / amber / purple / pink) are re-tuned so the `50` shade is a *dark tinted background* and the `700` shade is a *bright readable text*. This keeps banners like "Saved!" or "Could not delete" readable on dark.

Responsive behaviour: every page works on a 320 px phone up to a 4K monitor. The admin layout uses `lg:flex` so on phones the sidebar collapses into a hamburger drawer above the main content, and on desktop it sits as a fixed left column.

---

## 13. Setup & deployment

### Local development

```bash
npm install
cp .env.example .env
# edit .env: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
npx prisma migrate dev
npm run db:seed
npm run dev          # http://localhost:3000
```

### Demo accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Coach | `coach@hdcoaching.com` | `admin123` |
| Client | `demo@hdcoaching.com` | `client123` |

### Production deploy on the server

The site lives at `/home/hdcoachingnaty/htdocs/hdcoachingnaty.com` and is run by **PM2** under the process name `hd-coaching`. Standard deploy after pushing to GitHub:

```bash
cd /home/hdcoachingnaty/htdocs/hdcoachingnaty.com
git pull
npm install            # only if package.json changed
npm run build          # runs prisma generate + next build
pm2 restart hd-coaching
```

If a Prisma schema change was deployed, also run `npx prisma migrate deploy` before the restart.

### Environment variables on the server

- `DATABASE_URL` — MySQL connection string (CloudPanel-provided)
- `NEXTAUTH_SECRET` — long random string used to sign session cookies
- `NEXTAUTH_URL` — `https://hdcoachingnaty.com`

---

## 14. Seeded content

`prisma/seed.ts` populates the database with:

- **1 coach account** (`coach@hdcoaching.com`)
- **1 demo client** (`demo@hdcoaching.com`) with a few weeks of fake weight logs and measurements
- **~140 exercises** across Push / Pull / Legs / Core / Cardio / Olympic / Full Body
- **~70 foods** across Protein / Carbs / Fats / Vegetables / Fruits / Dairy / Drinks

Re-running `npm run db:seed` will reset the demo data (idempotent on the libraries: it upserts by name).

---

## 15. Common day-to-day tasks (cheat sheet)

| Goal | Steps |
| --- | --- |
| Add a new client | Coach panel → Clients → "Add client" → enter name / email / temporary password → send those details to the client |
| Reset a client's password | Coach panel → click a client → "Edit account" → set a new password → save |
| Build a training program | Coach panel → client profile → "Add training program" → add days, pick exercises from library, set sets/reps/rest → Save |
| Build a diet plan | Coach panel → client profile → "Add diet plan" → set targets, add meals, pick foods + quantities → Save |
| Add a new exercise to the library | Coach panel → Exercises → "New exercise" → fill the form → Save |
| Change own password | Settings → "Change password" |
| Switch site language | Globe button in header / sidebar |

---

## 16. Known limitations / future ideas

- **No email sending.** Creating a client does not email them — coach must send their credentials manually.
- **No auto meal-plan generation.** Coach must hand-pick foods. Could be added (Eat-This-Much-style auto-fill from macro targets).
- **No client messaging.** No in-app chat between coach and client.
- **No notifications / reminders.** No "log your weight" push notifications.
- **Single coach.** The platform assumes one ADMIN account. Adding a second coach works in the database (just create another ADMIN user manually), but there is no "team" UI.
- **Local photo storage.** Photos are on the server's filesystem. For scale, move them to S3 / CloudPanel object storage.
- **No backup automation.** Backups depend on the host's database snapshots.

---

*Last updated: 2026-05-12.*
