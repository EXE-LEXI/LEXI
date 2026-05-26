# LEXI

> Level up your rights with LEXI.

LEXI turns everyday Vietnamese legal situations into short lessons, quizzes,
progress tracking, and review flows.

## Project Structure

- `backend` - NestJS API, Prisma, PostgreSQL.
- `frontend` - React web app.

The repository is now focused on backend + frontend for deployment. Legacy
mobile/docs/tasks folders are ignored by Git.

## Backend Quick Start

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Demo accounts after seed:

- Learner: `demo@lexi.vn` / `123456`
- Admin: `admin@lexi.vn` / `123456`

## Frontend Quick Start

```bash
cd frontend
npm install
npm run dev
```

The frontend reads `VITE_API_BASE_URL` from `frontend/.env` and defaults to
`http://localhost:3000`.
