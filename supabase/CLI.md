# Supabase CLI setup

Use the Supabase CLI to connect this app to your database (including a different Supabase account than Cursor MCP).

## 1. Log in with your account

In a terminal inside this folder:

```powershell
supabase login
```

A browser window opens. Sign in with the Supabase account that owns your project.

To use a named profile (e.g. keep work and personal separate):

```powershell
supabase login --name personal
supabase projects list --profile personal
```

## 2. Create or pick a project

List projects:

```powershell
npm run db:projects
```

Create a new project (replace org id and password):

```powershell
supabase projects create flashcards `
  --org-id YOUR_ORG_ID `
  --db-password "choose-a-strong-password" `
  --region eu-west-2
```

List orgs to find `YOUR_ORG_ID`:

```powershell
supabase orgs list
```

## 3. Link this repo to the remote project

```powershell
supabase link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` is the short id in the project URL, e.g. `https://supabase.com/dashboard/project/abc123xyz` → `abc123xyz`.

Enter your database password when prompted.

## 4. Push the schema

Migrations live in `supabase/migrations/`. Apply them to your remote database:

```powershell
npm run db:push
```

This creates the `decks` and `flashcards` tables, RLS policies, and Realtime.

## 5. Copy API keys into `.env.local`

Fetch keys:

```powershell
supabase projects api-keys --project-ref YOUR_PROJECT_REF
```

Create `.env.local`:

```powershell
copy .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-cli
```

## Quick reference

| Command | What it does |
| --- | --- |
| `npm run db:login` | Sign in to Supabase |
| `npm run db:projects` | List your projects |
| `npm run db:link` | Link this folder to a remote project |
| `npm run db:push` | Apply migrations to remote DB |

## Switch accounts later

```powershell
supabase logout
supabase login
```

Or log in with a profile: `supabase login --name other-account`
