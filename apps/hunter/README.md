# Benefit Hunter

A small client-only React app for tracking free credits, community licenses, startup programs, and worthy discounts.

## Local Development

```bash
npm install
npm run dev
```

## Optional Supabase Sync

Signed-out users can use the app with local browser storage. To let signed-in users sync profile data and progress across devices:

1. Link the Supabase CLI with `supabase link --project-ref <project-ref>`.
2. Apply migrations with `supabase db push`.
3. Enable Google and GitHub providers in Supabase Auth.
4. Add these public browser env vars locally and in Vercel:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

The Vite config also accepts `SUPABASE_PROJECT_ID` plus `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_PUBLIC_ANON_KEY`, and only exposes the derived URL plus public browser key.

Do not expose provider client secrets, Supabase secret keys, or service role keys to the browser.

## Production Build

```bash
npm run build
```

Vercel can deploy this as a static Vite app with:

- Build command: `npm run build`
- Output directory: `dist`
