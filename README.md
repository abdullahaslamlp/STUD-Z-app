# Stud‑Z — AI Study Companion

Stud‑Z (Study‑Gen Z) is an AI‑powered study companion web app that helps students turn their own materials into focused revision workflows. It combines task management, rich study notes, AI assistant guidance, PDF/DOCX ingestion, and MCQ flashcard quizzes into a single dashboard.

---

## ✨ Features

- **Secure Auth & Profiles**
  - Email/password + Google sign‑in (Supabase + Lovable).
  - Per‑user profile with university, major, and semester.

- **Tasks & Study Notes**
  - Create, update, and track study tasks with priority and due dates.
  - Structured study notes with subjects and tags, persisted in Supabase.
  - All data is scoped per user via Row Level Security (RLS).

- **AI Study Companion**
  - “Stud‑Z” assistant panel on the dashboard.
  - Generates personalized study plans and tips grounded in your own tasks and notes.
  - Powered by the **Gemini API** (use your own API key; set `GEMINI_API_KEY` in Supabase Edge Function secrets).

- **Flashcards & Testing**
  - Flashcards page that generates MCQ quizzes from your existing notes.
  - Difficulty selection (easy / medium / hard) and question count.
  - Instant feedback, explanations, and score summary.

- **PDF / DOCX Ingestion**
  - Upload PDF or DOCX files as “study material”.
  - Edge function uses AI to read the document and extract structured, markdown‑style notes.
  - Extracted notes are saved into your `study_notes` and show up in the dashboard.

---

## 🛠 Tech Stack

- **Frontend**
  - Vite + React + TypeScript
  - React Router
  - Tailwind CSS + shadcn‑ui components
  - TanStack Query for data fetching and caching

- **Backend / Infra**
  - Supabase (Auth, Postgres, Storage, Edge Functions)
  - **Gemini API** (assistant, flashcards, document ingestion) — set `GEMINI_API_KEY` in Supabase; see [SETUP.md](./SETUP.md).
  - Row Level Security (RLS) for all user data

---

## 🚀 Getting Started (Local Development)

Prerequisites:

- Node.js and npm installed
- A Supabase project set up
- A Gemini API key and Supabase configured (see **[SETUP.md](./SETUP.md)** for secrets and database migrations)

1. **Clone the repository**

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

