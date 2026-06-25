# StudyLens — Deployment Guide (follow these steps exactly)

You will end up with a **live URL** you can submit, with a working Claude AI backend.
Total time: ~10-15 minutes. No coding required.

---

## Step 1 — Get a free Gemini API key
1. Go to https://aistudio.google.com/apikey
2. Sign in with any Google account
3. Click "Create API Key" → "Create API key in new project"
4. Copy the key (starts with `AIza...`) — keep this tab open, you'll need it in Step 4
5. This has a free tier with no credit card required — plenty for a class demo.

## Step 2 — Put this project on GitHub
1. Go to https://github.com/new
2. Name the repo `studylens` (any name works), keep it Public or Private, click "Create repository"
3. On the new repo page, click "uploading an existing file"
4. Drag in **the entire `studylens` folder contents** (not the folder itself — the files/folders inside it: `api/`, `public/`, `package.json`, `vercel.json`)
5. Click "Commit changes"

## Step 3 — Deploy to Vercel
1. Go to https://vercel.com/ and sign up using your GitHub account (free)
2. Click "Add New" → "Project"
3. Select your `studylens` repo → click "Import"
4. Leave all build settings as default
5. **Before clicking Deploy**, expand "Environment Variables" and add:
   - Name: `GEMINI_API_KEY`
   - Value: (paste the key from Step 1)
6. Click "Deploy"
7. Wait ~1 minute. Vercel will give you a live URL like `studylens-yourname.vercel.app`

**That's it — that URL is your live, working submission link.**

## Step 4 — Test it
Open your live URL:
- Go to **Notes** → paste some text or upload a PDF → click Summarize
- Try **Quiz**, **Flashcards**, and **AI Tutor**
- If something says "Server misconfigured," double check the environment variable name is exactly `ANTHROPIC_API_KEY` and redeploy

## If something breaks before your deadline
- Vercel → your project → "Deployments" tab shows build logs if something failed
- Most common issue: typo in the environment variable name (must be exactly `GEMINI_API_KEY`), or forgetting to redeploy after adding it (Settings → Environment Variables → Save → then Deployments → "Redeploy")

---

## What's inside this project
- `public/` — the entire frontend (HTML/CSS/JS), what users see
- `api/claude.js` — the one backend file. It receives requests from the frontend, attaches your secret Gemini API key, and forwards them to Google's Gemini API. This is what keeps your key safe and lets you use the *real* AI API.
- `vercel.json` / `package.json` — tells Vercel how to run the project

## Features included
- **Notes → AI Summary** — paste text or upload a `.txt`/`.pdf`, get a Claude-generated summary + subject detection + keywords
- **Quiz Generator** — 5 AI-generated multiple-choice questions from your notes, with explanations
- **Flashcards** — 8 AI-generated flip cards
- **AI Tutor** — asks you questions based on your own notes; if you get one wrong, it explains the correct concept and points you back to the specific part of your notes it came from
- **Pomodoro Timer** — 25/5 focus timer
- **Dashboard** — tracks your stats (summaries, quizzes, flashcards reviewed) and per-subject quiz performance, stored in your browser
- // cllg project 

