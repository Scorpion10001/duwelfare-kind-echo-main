# Duwelfare

An anonymous welfare reporting site for students. No login, name or email is needed to
report an issue, share a suggestion, or track a ticket. Welfare staff sign in to review
reports and post updates.

Built with TanStack Start, React 19, Tailwind CSS 4, Framer Motion and Supabase.

## Run it locally

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase **SQL editor**, paste and run `supabase/setup.sql`.
3. Copy `.env.example` to `.env` and fill in your project URL and publishable key
   (Project Settings → API).
4. Install and start:

   ```bash
   npm install
   npm run dev
   ```

   The site opens at http://localhost:8080.

## Create a staff account

1. In Supabase go to **Authentication → Users → Add user** and create an account.
2. Give it the staff role in the SQL editor:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('PASTE-THE-USER-ID-HERE', 'welfare_staff');
   ```

3. Sign in at `/admin`.

## Publish an announcement

Staff accounts can insert rows into `welfare_announcements` (set `published = true`).

## Scripts

| Command           | What it does              |
| ----------------- | ------------------------- |
| `npm run dev`     | Start the dev server      |
| `npm run build`   | Production build          |
| `npm run preview` | Preview the build         |
| `npm test`        | Run the tests             |
| `npm run lint`    | Lint the code             |
