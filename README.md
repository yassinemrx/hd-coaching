# HD Coaching

A private fitness-coaching SaaS: the coach manages clients through an admin dashboard, and each client gets a personal portal to log progress and view their assigned diet and training plans.

Built with **Next.js 14 (App Router)**, **Prisma + SQLite** (dev), **NextAuth (credentials)**, **Tailwind CSS**, and **Recharts**. See `fitness-coach-platform-plan.md` for the original design.

## Local setup

```bash
npm install
cp .env.example .env       # already created for you in dev
npx prisma migrate dev     # creates prisma/dev.db
npm run db:seed            # seeds admin + demo client + sample plans
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

### Demo accounts

| Role   | Email                  | Password    |
| ------ | ---------------------- | ----------- |
| Coach  | `coach@hdcoaching.com` | `admin123`  |
| Client | `demo@hdcoaching.com`  | `client123` |

The coach lands at `/admin`, the client at `/dashboard/progress`.

## Routes

### Client (`USER` role)

| Path                   | What                                                    |
| ---------------------- | ------------------------------------------------------- |
| `/login`               | Client sign-in                                          |
| `/dashboard/progress`  | Daily weight log + chart, body measurements, photos     |
| `/dashboard/diet`      | View-only diet plan: macros + meal breakdown            |
| `/dashboard/training`  | View-only training program: days + exercises            |

### Coach (`ADMIN` role)

| Path                                  | What                                |
| ------------------------------------- | ----------------------------------- |
| `/admin/login`                        | Coach sign-in                       |
| `/admin`                              | Overview cards + recent clients     |
| `/admin/clients`                      | Client list (add / edit / delete)   |
| `/admin/clients/new`                  | Create a client account             |
| `/admin/clients/[id]`                 | Client detail (progress data)       |
| `/admin/clients/[id]/edit`            | Edit client account / reset password |
| `/admin/clients/[id]/diet`            | Diet plan editor                    |
| `/admin/clients/[id]/training`        | Training program editor             |

### API

All routes enforce session role and ownership server-side.

- `POST /api/weight`, `DELETE /api/weight/[id]` — client only, scoped to session user
- `POST /api/measurements`, `DELETE /api/measurements/[id]` — same
- `POST /api/photos`, `DELETE /api/photos/[id]` — multipart upload to `/public/uploads`
- `POST /api/clients`, `PATCH/DELETE /api/clients/[id]` — admin only
- `PUT /api/clients/[id]/diet` — admin only, full upsert
- `PUT /api/clients/[id]/training` — admin only, full upsert

## Photo storage

Uploads land in `/public/uploads`. To swap for Cloudinary later, replace the body of `src/lib/upload.ts` and `DELETE` in `src/app/api/photos/[id]/route.ts` — the rest of the app is unchanged.

## Useful scripts

```bash
npm run dev          # start dev server
npm run build        # production build (runs prisma generate first)
npm start            # serve the production build
npm run db:migrate   # create + apply a new migration
npm run db:push      # push schema without a migration (dev only)
npm run db:seed      # re-seed (wipes + repopulates demo data)
npm run db:studio    # open Prisma Studio
```

## Switching to PostgreSQL for production

1. Set `DATABASE_URL` to your Postgres connection string.
2. Change the `datasource db { provider = "sqlite" }` line in `prisma/schema.prisma` to `provider = "postgresql"`.
3. Delete the `prisma/migrations` folder and run `npx prisma migrate dev --name init`.

The `role` column is a string (so the schema is portable). If you want a real Postgres enum, change `role String @default("USER")` to a Prisma `enum Role { ADMIN USER }` and update `prisma/seed.ts` and `src/lib/auth.ts` accordingly.

## CloudPanel deployment notes

1. Install Node.js 20+ in CloudPanel.
2. Provision Postgres, set `DATABASE_URL` in `.env`.
3. `npm ci && npx prisma migrate deploy && npm run build`.
4. Start with PM2: `pm2 start npm --name hd-coaching -- start`.
5. Configure a reverse proxy in CloudPanel pointing to port 3000 and add SSL via Let's Encrypt.
6. Required env vars: `DATABASE_URL`, `NEXTAUTH_SECRET` (long random string), `NEXTAUTH_URL` (https URL of the site).
