# Stud-Z setup (your own Supabase + Gemini)

This app uses **your own Gemini API key** for all AI features (assistant, flashcards, document ingestion). Follow these steps to run it with your Supabase project.

---

## 1. Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Create or copy an API key.

**Do not commit the key to git.** Store it only in Supabase secrets (and optionally in local `.env` for testing).

---

## 2. Supabase project setup

### Create a project (if needed)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project (or use an existing one).
2. Note your **Project URL** and **anon/public key** (Settings → API). You’ll need them for the frontend env.

### Add the Gemini API key as a secret (required for Edge Functions)

Edge Functions (AI assistant, flashcards, document ingestion) need `GEMINI_API_KEY`:

1. In Supabase Dashboard: **Project Settings** → **Edge Functions** (or **Settings** → **Edge Functions**).
2. Open **Secrets** / **Environment variables** for Edge Functions.
3. Add a secret:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** your Gemini API key from step 1.

Redeploy or restart Edge Functions after adding the secret so they pick it up.

---

## 3. Database: run migrations on your Supabase DB

The app expects tables and policies created by the repo migrations. If your Supabase database is empty or not yet set up:

1. Install the Supabase CLI (if you haven’t):
   - **Windows:** `npm install -g supabase` or use the [installer](https://github.com/supabase/cli#install-the-supabase-cli).
   - **Mac/Linux:** `brew install supabase/tap/supabase` or see [Supabase CLI](https://supabase.com/docs/guides/cli).

2. Log in and link your project:
   ```bash
   supabase login
   cd /path/to/stud-z-7d98ec5a
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   Find `YOUR_PROJECT_REF` in Supabase Dashboard → Project Settings → General → Reference ID.

3. Run migrations against the linked project:
   ```bash
   supabase db push
   ```
   Or, to run SQL files manually: Supabase Dashboard → **SQL Editor** → run each file under `supabase/migrations/` in order (by filename date).

4. **Storage bucket:** The app uses a bucket named `materials`. If it doesn’t exist:
   - Dashboard → **Storage** → **New bucket** → name: `materials`.
   - Add policies so authenticated users can upload/read/delete their own files (see `supabase/migrations/20260314094712_*.sql` for the intended RLS policies for storage).

After this, your database and storage will match what the app expects.

---

## 4. Frontend environment variables

Create a `.env` (or `.env.local`) in the project root with your Supabase keys (never commit real keys to git):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Get these from Supabase Dashboard → Settings → API (Project URL and anon public key).

---

## 5. Deploy Edge Functions (if you use Supabase hosting)

From the project root:

```bash
supabase functions deploy ai-assistant
supabase functions deploy flashcards-from-notes
supabase functions deploy ingest-material
```

Ensure `GEMINI_API_KEY` is set in the project’s Edge Function secrets before or after deploy.

---

## Summary checklist

- [ ] Gemini API key created at Google AI Studio.
- [ ] `GEMINI_API_KEY` added in Supabase Edge Function secrets.
- [ ] Supabase project created/linked.
- [ ] Migrations applied (`supabase db push` or run migration SQL files).
- [ ] Storage bucket `materials` exists with correct policies.
- [ ] Frontend `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Edge Functions deployed (if using Supabase hosting).

After this, the app’s AI features (assistant, flashcards, PDF/DOCX notes) will use your Gemini key via the Edge Functions.
