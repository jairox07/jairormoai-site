# jairoromo.ai — Full Site Design Spec

**Date:** 2026-06-03
**Status:** Approved
**Author:** Brainstorming session with Jairo Romo

---

## 1. Project Overview

Personal brand website for Jairo Romo (@jairoromo.ai). IA consultant, builder, speaker.

**Taglines:** "El futuro es ligero." · "IA sin fricción." · "Inteligencia sin fricción."

**Posicionamiento:** IA aplicada al mundo real. Sin teoría vacía. Sin promesas falsas.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | SSR/SSG, file-based routing, Vercel-native |
| Styling | Tailwind CSS | Utility-first, design tokens via config |
| Animation | Framer Motion | Declarative motion, layout animations |
| Auth | Supabase Auth | Cookie-based SSR, social OAuth built-in |
| Database | Supabase PostgreSQL | Realtime, RLS, storage included |
| Payments | Stripe | Checkout sessions, webhooks, customer portal |
| Sessions booking | Cal.com (free plan) | Stripe-native, embed widget, no custom webhook needed |
| Video | Mux | Adaptive streaming, pay-per-use, clean API |
| Deploy | Vercel | Zero-config Next.js, edge functions |

---

## 3. Brand Identity

### Colors (Tailwind config)
```js
colors: {
  bg:    '#080B14',
  bg2:   '#0C1120',
  bg3:   '#0F1628',
  cyan:  '#4FC3F7',
  purp:  '#8B5CF6',
  mid:   '#6B8EF5',
  gray:  '#94A3B8',
  gray2: '#3D4F63',
}
```

### Typography
- **Sora** (Google Fonts): weights 300, 400, 700, 900 — all headings + UI
- **Space Mono**: weights 400, 700 — eyebrows, labels, code, handles

### Design Rules
- Background: `#080B14` navy profundo
- Bokeh orbs only — no grid backgrounds
- Gradient topline (3px) on every page
- Gradient: `linear-gradient(135deg, #4FC3F7, #6B8EF5, #8B5CF6)`
- Logo: JR SVG monogram (cyan→purp gradient strokes) — not text badge
- No gradient text (impeccable rule)
- No side-stripe borders >1px
- Motion: ease-out-expo curves only, no bounce/elastic

### Animation System
- **Hero canvas:** Constellation starfield — 80 stars, mouse attraction radius 180px, connection lines at 140px distance, opacity 0.18 max
- **Click effects:** Ripple + 8-particle burst, cyan/mid/purp palette, 500ms ease-out-expo
- **Scroll parallax:** Hero text translateY at -0.15x scroll, photo at -0.08x scroll
- **Photo 3D tilt:** perspective(800px) rotateX/Y on mousemove, 4deg max
- **Hover buttons:** translateY(-2px) + box-shadow amplify
- **Page transitions:** Framer Motion AnimatePresence, fade+slide 300ms

---

## 4. App Structure

```
jairormoai-site/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Home
│   │   ├── sessions/page.tsx         # 1:1 Sessions
│   │   └── vault/page.tsx            # AI Repository
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   └── courses/
│   │       ├── page.tsx              # Course catalog
│   │       └── [slug]/
│   │           ├── page.tsx          # Course detail
│   │           └── [lessonId]/page.tsx  # Lesson player
│   ├── api/
│   │   ├── stripe/webhook/route.ts
│   │   └── mux/upload-token/route.ts
│   ├── layout.tsx                    # Root layout (nav, topline, fonts)
│   └── globals.css
├── components/
│   ├── ui/                           # Base: Button, Input, Card, Badge
│   ├── layout/                       # Navbar, Footer, PageTransition
│   ├── constellation/                # Canvas starfield component
│   ├── home/                         # HeroSection, StatsBar, SocialRow, ContactForm
│   ├── sessions/                     # SessionCard, CalEmbed
│   ├── vault/                        # ProjectCard, FilterBar
│   └── courses/                      # CourseCard, LessonPlayer, ProgressBar
├── lib/
│   ├── supabase/                     # client.ts, server.ts, middleware.ts
│   ├── stripe.ts
│   └── mux.ts
├── public/
│   ├── logo.svg                      # JR monogram
│   └── jairo-photo.png               # Profile photo (transparent bg)
└── middleware.ts                     # Auth guard for /protected/*
```

---

## 5. Pages

### 5.1 Home (`/`)

**Sections (top to bottom):**
1. **Navbar** — sticky, blur backdrop, logo + nav links + login CTA
2. **Hero** — split layout: left (eyebrow, H1, subtitle, tags, CTAs, social row) / right (photo circular with gradient ring + floating dots). Canvas constellation bg. Scroll parallax. Mouse 3D tilt on photo.
3. **Stats Bar** — 5 stats: `50+ Proyectos IA` / `5K+ Comunidad` / `+3000 hrs probando IAs` / `Desde 2022` / `2 Cursos`. Subtle cyan numbers.
4. **Experiencia / Timeline** — professional timeline (to be filled by Jairo). Alternating left/right cards.
5. **Collaboration CTA** — fullwidth dark card, strong headline, email button.
6. **Donation** — elegant section with Stripe Payment Link. Simple, not flashy.
7. **Contact Form** — 4 fields: Nombre, Email, Empresa, WhatsApp. Supabase insert on submit. Success state animation.
8. **Footer** — logo, nav links, social icons, copyright.

**Social links (all @jairoromo.ai):**
- TikTok: `https://tiktok.com/@jairoromo.ai`
- Instagram: `https://instagram.com/jairoromo.ai`
- YouTube: `https://youtube.com/@jairoromo.ai`
- GitHub: `https://github.com/jairoromo`

### 5.2 Sessions (`/sessions`)

**3 packages (Stripe Checkout):**
| Package | Duration | Price | Pitch |
|---|---|---|---|
| Enfoque Rápido | 20 min | $15 USD | Una pregunta concreta, una respuesta clara. Para desbloquear ese punto donde estás atascado. No apta para estrategia compleja ni múltiples temas. |
| Sesión de Trabajo | 45 min | $79 USD | Revisamos tu proyecto, diagnosticamos el problema y trazamos próximos pasos reales. La más popular. No apta para rediseños completos de arquitectura. |
| Consultoría Profunda | 90 min | $297 USD | Para proyectos serios. Estrategia de IA aplicada a tu negocio, decisiones de arquitectura, roadmap accionable. No apta para preguntas simples. |

**Flow:**
1. User selects package → Stripe Checkout opens
2. Payment success → redirect to `/sessions/success?session_id=xxx`
3. Success page verifies Stripe session → reveals Cal.com embed widget
4. Cal.com handles calendar booking (Stripe payment already done on our side)

**UI:** 3 cards side-by-side. Selected card gets gradient border. Price prominent. "Agendar" CTA.

### 5.3 AI Vault (`/vault`)

**Layout:** Masonry or 3-col grid of project cards.

**Card content:** Category pill · Project name · Tech stack tags · 2-line description · Demo/Code buttons

**Filter bar:** Automatizaciones | Machine Learning | LLMs | RAGs | All

**Data:** Stored in Supabase `projects` table. Admin adds via Supabase Studio initially.

### 5.4 Auth (`/login`, `/signup`)

- Minimal centered card on dark bg with constellation canvas
- Email + password fields
- Google OAuth button (Supabase)
- `/login` → on success → redirect to `/dashboard`
- `/signup` → on success → redirect to `/dashboard` with welcome animation
- Supabase Auth cookie-based (SSR compatible)

### 5.5 Dashboard (`/dashboard`) — protected

- Welcome message with user name
- Enrolled courses grid with progress bars
- Quick links: vault, sessions, profile

### 5.6 Courses (`/courses`) — catalog public, content protected

**Catalog page:** Course cards with: thumbnail, title, description, price, lesson count, duration, "Comprar" CTA

**Initial courses:**
1. **Fundamentos y Automatización con IA** — intro level
2. **IA Avanzada para Empresas: Implementación en Producción** — advanced

**Purchase flow:** Stripe Checkout → webhook → insert `enrollments` row → user can access `/courses/[slug]`

**Lesson player page (protected):**
- Left sidebar: lesson list with check marks
- Main area: Mux video player
- Below: lesson materials (downloadable files from Supabase Storage)
- Progress auto-saved to `enrollments.progress` JSON

---

## 6. Database Schema (Supabase)

```sql
-- Extended user profiles
profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz default now()
)

-- AI Vault projects
projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text check (category in ('automatizaciones','ml','llms','rags')),
  tech_stack text[],
  demo_url text,
  repo_url text,
  featured boolean default false,
  created_at timestamptz default now()
)

-- LMS courses
courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  thumbnail_url text,
  price_cents integer not null,
  stripe_price_id text not null,
  published boolean default false,
  created_at timestamptz default now()
)

-- Course lessons
lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses on delete cascade,
  title text not null,
  mux_asset_id text,
  mux_playback_id text,
  order_index integer not null,
  duration_seconds integer,
  downloadable_url text,
  created_at timestamptz default now()
)

-- User enrollments + progress
enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  course_id uuid references courses on delete cascade,
  stripe_session_id text,
  progress jsonb default '{}', -- {lessonId: completed_at}
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
)

-- Contact form submissions
contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  whatsapp text,
  created_at timestamptz default now()
)
```

**RLS Policies:**
- `profiles`: user can read/update own row
- `projects`: public read, no write from client
- `courses`: public read, no write from client
- `lessons`: read only if enrolled (via enrollments table)
- `enrollments`: user reads own rows; insert only via server (webhook)
- `contact_submissions`: insert only from anon

---

## 7. Key Technical Decisions

### Stripe Webhook
Single endpoint at `/api/stripe/webhook`. On `checkout.session.completed`:
- Verify signature with `stripe.webhooks.constructEvent`
- Insert into `enrollments` (courses) or log sessions booking (not needed — Cal.com handles it)

### Mux Integration
- Upload tokens generated server-side at `/api/mux/upload-token`
- Playback via `@mux/mux-player-react` component
- Asset IDs stored in `lessons.mux_asset_id`

### Cal.com Sessions
- Free plan, Stripe payment collection enabled in Cal.com dashboard
- Sessions page handles its own payments natively
- After Stripe checkout on our site (optional upsell flow), show Cal.com embed

### Middleware Auth
```ts
// middleware.ts
matcher: ['/dashboard/:path*', '/courses/:path*/lessons/:path*']
```
Redirects unauthenticated users to `/login?redirect=<original_path>`.

---

## 8. Assets

| Asset | Path | Notes |
|---|---|---|
| JR Logo SVG | `public/logo.svg` | Recreated from brand image, cyan→purp gradient strokes |
| Jairo photo | `public/jairo-photo.png` | PNG with transparent background, circular crop applied in CSS |
| Favicon | `public/favicon.ico` | Logo mark at 32x32 |

---

## 9. Phases

**Phase 1 (this plan):** Home + Auth + Sessions + AI Vault
**Phase 2:** LMS (Courses + Lesson Player + Enrollments)
**Phase 3:** Dashboard polish + Downloads area

---

## 10. Out of Scope (Phase 1)

- Community/feed module
- Live Events page
- Admin CMS (use Supabase Studio)
- Email notifications (can add later via Resend)
