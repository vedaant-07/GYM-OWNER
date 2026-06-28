# SE7EN FIT Gym Owner Website

Production gym-owner management website for SE7EN FIT.

## Production backend

This website is now connected to the shared SE7EN FIT production backend API:

```bash
https://se7en-fit-api.onrender.com/api
```

The production stack is:

```text
GYM-OWNER website → Render Backend API → Supabase PostgreSQL + Supabase Storage
```

The website must not use a separate database or disconnected local/demo data source.

## Render deployment

This repository includes a Render Blueprint file:

```text
render.yaml
```

Render should create this service:

```text
se7enfit-gym-owner
```

Recommended Render setup:

```text
Project: SE7EN FIT
Service type: Static Site
Repository: vedaant-07/GYM-OWNER
Branch: main
Build command: npm install && npm run build
Publish directory: dist
```

Required environment variables in Render:

```bash
VITE_API_BASE_URL=https://se7en-fit-api.onrender.com/api
NODE_VERSION=22
```

Optional only if a future direct Supabase read feature is approved:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

After adding the variables, click **Save, rebuild, and deploy** in Render.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:

```bash
VITE_API_BASE_URL=https://se7en-fit-api.onrender.com/api
```

## Production build

```bash
npm run build
npm run preview
```

## Production integration files

```text
src/lib/api-client.js              # Shared production API fetch client
src/api/base44Client.js            # Compatibility adapter entrypoint
src/api/supabaseBase44Adapter.js   # Production API-backed Base44 compatibility adapter
src/lib/AuthContext.jsx            # Token/session auth context for owner login/register/session restore
src/pages/Login.jsx                # Owner login + production OTP verification
src/pages/Register.jsx             # Owner registration + production OTP verification
src/index.css                      # SE7EN FIT theme
render.yaml                        # Render Static Site deployment config
```

## Connected production workflows

- Gym owner login/register through shared backend OTP auth
- Gym owner onboarding through `/api/gym-owners/onboarding`
- Gym profile through `/api/gym-owners/me`
- Referred users/members through `/api/gym-owner/members`
- Leads through `/api/gym-owner/leads` and `/api/gym-leads`
- Attendance through `/api/gym-owner/attendance`
- Equipment through `/api/gym-owner/equipment`
- Campaigns/ads through `/api/gym-owner/advertisements`
- Support tickets through `/api/support/tickets`
- Media upload through `/api/uploads/media`
