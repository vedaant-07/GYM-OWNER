# SE7EN FIT Gym Owner Website Integration Audit

This repo is the public SE7EN FIT website plus the authenticated gym management tool.

Primary integration target:

```text
GYM-OWNER frontend → SE7EN FIT Render Backend API → Supabase
```

The website should not become a separate backend or separate data source.

---

## Current state

- Vite React app.
- Authenticated dashboard layout already exists.
- Existing routes include dashboard, members, referred users, attendance, leads, payments, plans, campaigns, WhatsApp, email, automations, notifications, challenges, staff, classes, equipment, reviews, referrals, reports, gym profile, settings, and admin.
- Current Base44 compatibility adapter maps some entities directly to Supabase tables.
- Current `api-client` default URL still points to `https://se7enfit-original.onrender.com` and must be replaced with the final shared production API URL.

---

## Production responsibility

### Public website

Required sections:

- Home / hero
- App features
- For users
- For gym owners
- Pricing
- Download app
- Contact/support
- Login/register

Download app section:

```text
Play Store button
App Store button
APK direct download, optional before Play Store launch
QR code, optional
```

### Gym management tool

Required sections:

- Overview
- Members
- Referred users
- Leads
- Attendance
- Plans/pricing
- Staff
- Classes
- Equipment
- Workout plans
- Diet plans
- Assigned workouts
- Assigned diets
- Ads/offers/campaigns
- Leaderboard/prizes
- Reviews
- Support tickets
- Reports/analytics
- Gym profile/settings

---

## Data ownership rules

Gym owner can manage only their own gym data:

```text
gyms.owner_user_id = current user
or gym_staff.user_id = current user with permission
```

Gym owner must not be able to read or update another gym's:

- Members
- Leads
- Attendance
- Ads
- Plans
- Equipment
- Payments
- Reports

Admin can control everything from the admin dashboard.

---

## Required shared APIs

This website must move toward the shared API contract in `SE7EN-FIT/docs/API_CONTRACT.md`.

Priority routes for this repo:

```text
GET    /api/gym-owners/me
PUT    /api/gym-owners/me
POST   /api/gym-owners/onboarding
GET    /api/gym-owner/members
PATCH  /api/gym-owner/members/:id
GET    /api/gym-owner/leads
PATCH  /api/gym-owner/leads/:id
GET    /api/gym-owner/attendance
GET    /api/gym-owner/equipment
POST   /api/gym-owner/equipment
PATCH  /api/gym-owner/equipment/:id
DELETE /api/gym-owner/equipment/:id
GET    /api/gym-owner/advertisements
POST   /api/gym-owner/advertisements
PATCH  /api/gym-owner/advertisements/:id
DELETE /api/gym-owner/advertisements/:id
GET    /api/gym-owner/leaderboard
POST   /api/gym-owner/leaderboard/prizes
GET    /api/support/tickets/me
POST   /api/support/tickets
```

---

## Missing or incomplete production features

| Area | Status | Required action |
|---|---|---|
| Final shared API URL | Not standardized | Replace old default with final API URL after backend deploy |
| Public app download section | Missing/incomplete | Add Play Store/App Store/APK buttons |
| Gym membership source of truth | Not final | Use `gym_memberships` from central API |
| Referred app users | Partial | Connect referral code to user app membership flow |
| Ads/offers | Needs production media | Use backend upload + ad targeting API |
| Leaderboard/prizes | Needs backend | Use centralized scoring/prize APIs |
| Support tickets | Needs route/page | Send to shared `support_tickets` |
| Staff permissions | Needs backend rules | Use `gym_staff.permissions` |
| Analytics | Needs aggregate APIs | Add dashboard metrics endpoints |
| Payments/subscriptions | Needs provider/table | Connect after payment provider chosen |

---

## Safe work rules

This repo can be changed directly for UI/UX and missing pages.

Do not add secrets to frontend.

Use only public/publishable Supabase keys in frontend if Supabase direct reads are still temporarily needed. All privileged writes must go through backend.

---

## Implementation order for this repo

1. Standardize environment variables.
2. Add/verify public download app section.
3. Add a shared API client that uses the final backend API.
4. Move owner dashboard data to typed backend routes.
5. Add support ticket page.
6. Connect ads/offers upload and targeting.
7. Connect leaderboard/prizes.
8. Connect reports/analytics.
9. Remove or reduce direct Supabase compatibility adapter usage.
