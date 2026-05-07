# Fitness Coach Platform — Full Project Plan

## Overview

A full-stack SaaS web application for a fitness coach to manage clients, track progress, assign diet plans, and build training programs. The coach operates through a private admin dashboard; each client gets a personal login to view their own data and log daily progress.

---

## Recommended Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | **Next.js 14 (App Router)** | Full-stack React, SSR, easy routing |
| Styling | **Tailwind CSS** | Fast, responsive, consistent UI |
| Backend / API | **Next.js API Routes** | No separate server needed |
| Database | **PostgreSQL** | Reliable relational DB, fits structured fitness data |
| ORM | **Prisma** | Clean schema, migrations, type safety |
| Auth | **NextAuth.js** | Role-based sessions (admin / user) |
| File Storage | **Cloudinary** | Progress photo uploads (free tier available) |
| Hosting | **CloudPanel (VPS)** | Your existing host; deploy as Node.js app |
| Process Manager | **PM2** | Keep the app running on the server |

---

## Roles

### Coach (Admin)
- Logs in at `/admin`
- Can create / edit / delete client accounts
- Sets username & password for each client
- Views all client data (weight logs, measurements, photos)
- Creates and assigns diet plans and training programs

### Client (User)
- Logs in at `/login`
- Sees only their own data
- Logs daily weight, body measurements, weekly photos
- Views their assigned diet plan and training program

---

## Database Schema (Prisma)

```
User
  id, name, email, passwordHash, role (ADMIN | USER), createdAt

WeightLog
  id, userId, date, weightKg, createdAt

BodyMeasurement
  id, userId, date, chest, waist, hips, thighs, arms, createdAt

ProgressPhoto
  id, userId, weekLabel, photoUrl (Cloudinary), createdAt

DietPlan
  id, userId, title, notes, createdAt
  └── MacroTarget: calories, protein, carbs, fat
  └── Meal[]: name, time, foods (text/JSON)

TrainingProgram
  id, userId, title, notes, startDate, createdAt
  └── TrainingDay[]: dayLabel (e.g. "Monday – Push")
      └── Exercise[]: name, sets, reps, rest, notes
```

---

## Pages & Features

### Auth Pages
- `/login` — Client login
- `/admin/login` — Coach login
- Role-based redirect after login (admin → `/admin`, user → `/dashboard`)

---

### Client Pages

#### Page 1 — Progress Tracker (`/dashboard/progress`)
**Daily Weight Log**
- Input field: today's weight (kg or lbs)
- Chart: weight over time (line chart, last 30 / 90 days)
- History table: date + weight

**Body Measurements**
- Input fields: chest, waist, hips, thighs, arms (cm or inches)
- History table with all past entries
- Optional: comparison chart

**Photos of the Week**
- Upload up to 3 photos per week (front, side, back)
- Label: auto-tagged with week number + date
- Gallery view of past uploads

---

#### Page 2 — Diet Plan (`/dashboard/diet`)
**View-only for the client**
- Plan title and coach notes
- Daily macro targets: Calories / Protein / Carbs / Fat (displayed as cards)
- Meal breakdown: Meal name + time + foods listed

---

#### Page 3 — Training Program (`/dashboard/training`)
**View-only for the client**
- Program title and coach notes
- Days list (e.g. Monday, Wednesday, Friday)
- Each day expands to show exercises:
  - Exercise name
  - Sets × Reps
  - Rest time
  - Coach notes

---

### Admin Pages (Coach)

#### Dashboard (`/admin`)
- Summary cards: total clients, recent weight logs, new photos this week
- Quick links to each section

#### Client Management (`/admin/clients`)
- Table of all clients (name, email, last login, last weight log date)
- **Add Client** button: form with name, email, username, password
- **Edit** / **Delete** client
- Click a client → view all their data

#### Client Detail View (`/admin/clients/[id]`)
- View client's weight log chart + history
- View body measurement history
- View progress photos gallery
- Links to edit their diet plan and training program

#### Diet Plan Editor (`/admin/clients/[id]/diet`)
- Create or edit diet plan for this client
- Set macro targets (calories, protein, carbs, fat)
- Add meals: name, time, food description
- Save button

#### Training Program Editor (`/admin/clients/[id]/training`)
- Create or edit training program
- Add training days (label)
- Per day: add exercises with name, sets, reps, rest, notes
- Drag-to-reorder exercises (optional)
- Save button

---

## Project Folder Structure (Next.js App Router)

```
/app
  /admin
    /login          → Coach login page
    /page.tsx       → Admin dashboard
    /clients
      /page.tsx     → Client list
      /[id]
        /page.tsx   → Client detail
        /diet       → Diet plan editor
        /training   → Training program editor
  /dashboard
    /progress       → Page 1: Weight + Measurements + Photos
    /diet           → Page 2: Diet plan view
    /training       → Page 3: Training program view
  /login            → Client login page
  /api
    /auth/[...nextauth]
    /weight
    /measurements
    /photos
    /diet
    /training
    /clients

/prisma
  schema.prisma

/components
  /admin
  /client
  /shared
    Charts.tsx
    PhotoUpload.tsx
    MeasurementForm.tsx

/lib
  prisma.ts
  auth.ts
  cloudinary.ts
```

---

## Authentication & Security

- Passwords hashed with **bcrypt**
- Sessions managed by **NextAuth.js** with JWT strategy
- Middleware protects `/admin/*` routes (admin role only) and `/dashboard/*` (user role only)
- Clients cannot see or access other clients' data (server-side user ID checks on all API routes)

---

## Deployment on CloudPanel

1. Install **Node.js 20+** on the server via CloudPanel
2. Set up a **PostgreSQL** database in CloudPanel (or use a separate DB panel)
3. Clone project to server, run `npm install` and `npx prisma migrate deploy`
4. Build: `npm run build`
5. Start with **PM2**: `pm2 start npm --name "fitness-app" -- start`
6. Point domain to the app port (default 3000) via CloudPanel's reverse proxy / Nginx config
7. Set environment variables in a `.env` file:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Development Phases

### Phase 1 — Foundation
- [ ] Set up Next.js project + Tailwind + Prisma + NextAuth
- [ ] Design database schema and run first migration
- [ ] Build login pages for admin and client
- [ ] Role-based middleware and route protection

### Phase 2 — Client Features
- [ ] Page 1: Daily weight log (input + chart + history)
- [ ] Page 1: Body measurements (input + history table)
- [ ] Page 1: Progress photos (upload + gallery)
- [ ] Page 2: Diet plan viewer
- [ ] Page 3: Training program viewer

### Phase 3 — Admin Features
- [ ] Admin dashboard overview
- [ ] Client list + add/edit/delete client
- [ ] Client detail page (view progress data)
- [ ] Diet plan editor (create/edit per client)
- [ ] Training program editor (create/edit per client)

### Phase 4 — Polish & Deploy
- [ ] Responsive design (mobile-friendly)
- [ ] Input validation and error handling
- [ ] Deploy to CloudPanel server
- [ ] Configure domain + SSL (Let's Encrypt via CloudPanel)
- [ ] Test all flows as both admin and client

---

## Estimated Complexity

| Feature | Effort |
|---|---|
| Auth + roles | Medium |
| Weight log + chart | Low |
| Body measurements | Low |
| Photo upload | Medium (Cloudinary) |
| Diet plan editor + viewer | Medium |
| Training program editor + viewer | Medium |
| Admin client management | Medium |
| Deployment on CloudPanel | Medium |

**Total estimated development time (solo with Claude Code): 3–5 days**

---

## Notes for Claude Code

- Use `prisma` for all DB access — never raw SQL
- Use `next-safe-action` or plain API routes for server actions
- Keep all admin API routes protected with session role check: `if (session.user.role !== 'ADMIN') return 403`
- Use `react-hook-form` + `zod` for all forms and validation
- Use `recharts` for weight and measurement charts
- Use `next/image` for displaying progress photos
- Use `date-fns` for date formatting throughout the app
