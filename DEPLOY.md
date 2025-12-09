# IntroEngine Deployment Guide

## 1. Environment Variables
Configure these in your Vercel Project Settings or local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # Required for API/Engines
OPENAI_API_KEY="sk-..."
```

## 2. Database Setup
1. Go to Supabase SQL Editor.
2. Run the contents of `lib/db/schema.sql`.
3. This creates the tables: `contacts`, `targets`, `opportunities`, `messages`.

## 3. Deployment (Vercel)
1. Push code to GitHub.
2. Import project in Vercel.
3. Set Environment Variables.
4. Deploy.

## 4. Usage
- **Ingest Data**: POST to `/api/ingest/contacts` and `/api/ingest/targets` with JSON arrays.
- **Run Analysis**: Visit `/dashboard` and click "Run Analysis Engine".
- **AI Features**: ensure you have credits in your OpenAI account.

## 5. Scaling Improvements
- **Queue System**: Move `ScoringEngine` and `OutboundEngine` calls to a background queue (e.g. Inngest or Trigger.dev) to avoid Vercel Function timeouts (>10s).
- **Embeddings**: Use Pgvector to match companies by semantic similarity ("Google" vs "Alphabet") instead of string matching.
- **LinkedIn API**: Integrate official API or a proxy (e.g. Proxycurl) for real-time data instead of static uploads.
