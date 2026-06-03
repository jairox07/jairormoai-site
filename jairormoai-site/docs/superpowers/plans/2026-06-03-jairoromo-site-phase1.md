# jairoromo.ai — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Phase 1 of jairoromo.ai — Home, Auth, Sessions 1:1, and AI Vault — as a production-ready Next.js 14 app with Supabase, Stripe, Framer Motion, and the jairoromo.ai brand system.

**Architecture:** Single Next.js 14 App Router monorepo. Public routes (home, vault, sessions) use SSG where possible; auth routes use SSR via Supabase cookie-based session. Stripe Checkout for session payments; Cal.com embed revealed post-payment. Constellation canvas and all animations are client components.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Framer Motion · Supabase (Auth + PostgreSQL) · Stripe · shadcn/ui (base primitives) · Vercel deploy

---

## File Map

```
jairormoai-site/
├── app/
│   ├── layout.tsx                        # Root layout: fonts, topline, navbar, footer
│   ├── globals.css                       # Tailwind base + CSS vars
│   ├── page.tsx                          # Home
│   ├── sessions/
│   │   ├── page.tsx                      # Sessions catalog
│   │   └── success/page.tsx             # Post-payment Cal.com reveal
│   ├── vault/page.tsx                    # AI Repository
│   ├── login/page.tsx                   # Auth: login
│   ├── signup/page.tsx                  # Auth: signup
│   └── api/
│       └── stripe/
│           └── checkout/route.ts        # Create Stripe Checkout session
│           └── webhook/route.ts         # Stripe webhook handler
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PageTransition.tsx           # Framer Motion AnimatePresence wrapper
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── EyebrowPill.tsx
│   │   └── GradientTopline.tsx
│   ├── constellation/
│   │   └── ConstellationCanvas.tsx      # Canvas starfield, mouse-reactive
│   ├── home/
│   │   ├── HeroSection.tsx              # Split layout, photo, CTAs
│   │   ├── StatsBar.tsx                 # 5-stat bar
│   │   ├── SocialRow.tsx               # TikTok/IG/YT/GitHub buttons
│   │   ├── ExperienceTimeline.tsx       # Professional timeline
│   │   ├── CollabCTA.tsx               # Collaboration CTA section
│   │   ├── DonationSection.tsx         # Stripe Payment Link button
│   │   └── ContactForm.tsx             # 4-field form → Supabase insert
│   ├── sessions/
│   │   ├── SessionCard.tsx             # Package card with price + CTA
│   │   └── CalEmbed.tsx               # Cal.com iframe embed
│   └── vault/
│       ├── ProjectCard.tsx
│       └── FilterBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   └── server.ts                   # Server Supabase client (cookies)
│   ├── stripe.ts                       # Stripe server instance
│   └── constants.ts                    # Sessions packages data, social links
├── middleware.ts                        # Auth guard (not needed Phase 1 — no protected routes)
├── public/
│   ├── logo.svg                        # JR monogram SVG
│   └── jairo-photo.png                 # Profile photo PNG (transparent bg)
├── tailwind.config.ts
├── next.config.ts
└── .env.local                          # Keys (never commit)
```

---

## Task 1: Project Scaffold + Dependencies

**Files:**
- Create: `package.json` (via CLI)
- Create: `tailwind.config.ts`
- Create: `next.config.ts`
- Create: `app/globals.css`
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: Init Next.js project**

```bash
cd "C:/Users/Jairo Romo/GitClaudeCode/jairormoai-site"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
```

Choose: No to Turbopack if asked (stable), Yes to App Router.

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

- [ ] **Step 3: Configure Tailwind with brand tokens**

Replace `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:    '#080B14',
        bg2:   '#0C1120',
        bg3:   '#0F1628',
        cyan:  '#4FC3F7',
        purp:  '#8B5CF6',
        mid:   '#6B8EF5',
        gray:  '#94A3B8',
        gray2: '#3D4F63',
      },
      fontFamily: {
        sora:  ['Sora', 'sans-serif'],
        mono:  ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #4FC3F7 0%, #6B8EF5 50%, #8B5CF6 100%)',
        'brand-grad-r': 'linear-gradient(135deg, #8B5CF6 0%, #6B8EF5 50%, #4FC3F7 100%)',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scroll-hint': 'scroll-hint 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-12px) scale(1.15)' },
        },
        'scroll-hint': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '50%': { transform: 'scaleY(1)' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Configure globals.css**

Replace `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;700;900&family=Space+Mono:wght@400;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #080B14;
  --bg2: #0C1120;
  --bg3: #0F1628;
  --cyan: #4FC3F7;
  --purp: #8B5CF6;
  --mid: #6B8EF5;
  --gray: #94A3B8;
  --gray2: #3D4F63;
}

* { box-sizing: border-box; }

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  overflow-x: hidden;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg2); }
::-webkit-scrollbar-thumb { background: var(--gray2); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--cyan); }

/* Focus ring */
:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Configure next.config.ts**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 6: Create .env.local and .env.example**

`.env.local` (fill in real values — never commit):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.example` (commit this — values are placeholders):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_SITE_URL=
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at http://localhost:3000 with default Next.js page (no errors in terminal).

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 14 project with brand design tokens"
```

---

## Task 2: Supabase Setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com, create new project named `jairoromo-ai`. Copy URL and anon key into `.env.local`.

- [ ] **Step 2: Run DB migrations in Supabase SQL Editor**

```sql
-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- AI Vault projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text check (category in ('automatizaciones','ml','llms','rags')),
  tech_stack text[] default '{}',
  demo_url text,
  repo_url text,
  featured boolean default false,
  created_at timestamptz default now()
);

-- Contact form submissions
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  whatsapp text,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.contact_submissions enable row level security;

-- Policies
create policy "profiles: own read/write"
  on public.profiles for all
  using (auth.uid() = id);

create policy "projects: public read"
  on public.projects for select
  using (true);

create policy "contact_submissions: anon insert"
  on public.contact_submissions for insert
  with check (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 3: Create browser Supabase client**

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Create server Supabase client**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 5: Create middleware for session refresh**

Create `middleware.ts` at project root:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/ middleware.ts .env.example
git commit -m "feat: add Supabase client, server client, middleware, and DB schema"
```

---

## Task 3: Constants + Shared Data

**Files:**
- Create: `lib/constants.ts`

- [ ] **Step 1: Create constants file**

Create `lib/constants.ts`:

```ts
export const SOCIAL_LINKS = [
  { label: 'TikTok', href: 'https://tiktok.com/@jairoromo.ai', icon: 'tiktok' },
  { label: 'Instagram', href: 'https://instagram.com/jairoromo.ai', icon: 'instagram' },
  { label: 'YouTube', href: 'https://youtube.com/@jairoromo.ai', icon: 'youtube' },
  { label: 'GitHub', href: 'https://github.com/jairoromo', icon: 'github' },
] as const

export const HERO_STATS = [
  { value: '50+', label: 'Proyectos IA' },
  { value: '5K+', label: 'Comunidad' },
  { value: '+3000', label: 'Horas probando IAs' },
  { value: 'Desde 2022', label: 'En el campo' },
  { value: '2', label: 'Cursos activos' },
] as const

export const SESSION_PACKAGES = [
  {
    id: 'enfoque-rapido',
    name: 'Enfoque Rápido',
    duration: '20 min',
    price: 15,
    priceCents: 1500,
    currency: 'USD',
    pitch: 'Una pregunta concreta, una respuesta clara. Para desbloquear ese punto donde estás atascado.',
    notFor: 'No apta para estrategia compleja ni múltiples temas.',
    stripePriceId: '', // fill after creating in Stripe dashboard
    calLink: 'https://cal.com/jairoromo/20min',
    popular: false,
  },
  {
    id: 'sesion-trabajo',
    name: 'Sesión de Trabajo',
    duration: '45 min',
    price: 79,
    priceCents: 7900,
    currency: 'USD',
    pitch: 'Revisamos tu proyecto, diagnosticamos el problema y trazamos próximos pasos reales.',
    notFor: 'No apta para rediseños completos de arquitectura.',
    stripePriceId: '', // fill after creating in Stripe dashboard
    calLink: 'https://cal.com/jairoromo/45min',
    popular: true,
  },
  {
    id: 'consultoria-profunda',
    name: 'Consultoría Profunda',
    duration: '90 min',
    price: 297,
    priceCents: 29700,
    currency: 'USD',
    pitch: 'Para proyectos serios. Estrategia de IA aplicada a tu negocio, decisiones de arquitectura, roadmap accionable.',
    notFor: 'No apta para preguntas simples.',
    stripePriceId: '', // fill after creating in Stripe dashboard
    calLink: 'https://cal.com/jairoromo/90min',
    popular: false,
  },
] as const

export const HERO_TAGS = ['LLMs', 'RAG', 'Automatización', 'Agentes IA', 'Fine-tuning']

export const VAULT_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'automatizaciones', label: 'Automatizaciones' },
  { id: 'ml', label: 'Machine Learning' },
  { id: 'llms', label: 'LLMs' },
  { id: 'rags', label: 'RAGs' },
] as const
```

- [ ] **Step 2: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: add brand constants (social links, hero stats, session packages)"
```

---

## Task 4: UI Primitives

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Input.tsx`
- Create: `components/ui/EyebrowPill.tsx`
- Create: `lib/utils.ts`

- [ ] **Step 1: Create utility function**

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create Button component**

Create `components/ui/Button.tsx`:

```tsx
'use client'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-sora font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan'

    const variants = {
      primary: 'bg-brand-grad text-white shadow-[0_4px_28px_rgba(79,195,247,0.28)] hover:shadow-[0_8px_36px_rgba(79,195,247,0.4)] hover:-translate-y-0.5',
      ghost: 'bg-transparent text-white border border-white/15 hover:bg-white/5 hover:border-white/25',
      outline: 'bg-transparent text-cyan border border-cyan/30 hover:bg-cyan/5 hover:border-cyan/50',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-7 py-3.5 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

- [ ] **Step 3: Create Input component**

Create `components/ui/Input.tsx`:

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-gray2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3.5 rounded-xl',
            'bg-white/[0.04] border border-white/10 text-white',
            'font-sora text-sm placeholder:text-gray2',
            'transition-colors duration-200',
            'focus:outline-none focus:border-cyan/50 focus:bg-white/[0.06]',
            error && 'border-red-400/50',
            className
          )}
          {...props}
        />
        {error && (
          <span className="font-mono text-[11px] text-red-400">{error}</span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
```

- [ ] **Step 4: Create EyebrowPill component**

Create `components/ui/EyebrowPill.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface EyebrowPillProps {
  children: React.ReactNode
  live?: boolean
  className?: string
}

export function EyebrowPill({ children, live = false, className }: EyebrowPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        'font-mono text-[11px] font-bold tracking-[2.5px] uppercase text-cyan',
        'bg-cyan/[0.07] border border-cyan/[0.18] px-4 py-1.5 rounded-full',
        className
      )}
    >
      {live && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_#4FC3F7] animate-pulse-dot" />
      )}
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/ lib/utils.ts
git commit -m "feat: add Button, Input, EyebrowPill UI primitives"
```

---

## Task 5: Constellation Canvas

**Files:**
- Create: `components/constellation/ConstellationCanvas.tsx`

- [ ] **Step 1: Create ConstellationCanvas**

Create `components/constellation/ConstellationCanvas.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  opacity: number
}

const STAR_COUNT = 80
const CONNECT_DIST = 140
const MOUSE_RADIUS = 180
const MOUSE_PULL = 0.04

export function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      const { width: W, height: H } = canvas
      starsRef.current = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      }))
    }

    const draw = () => {
      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)

      const stars = starsRef.current
      const mouse = mouseRef.current

      for (const s of stars) {
        s.x += s.vx
        s.y += s.vy
        if (s.x < 0 || s.x > W) s.vx *= -1
        if (s.y < 0 || s.y > H) s.vy *= -1

        const dx = mouse.x - s.x
        const dy = mouse.y - s.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_PULL
          s.x += dx * force
          s.y += dy * force
        }
      }

      // Draw connection lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18
            ctx.beginPath()
            ctx.strokeStyle = `rgba(79,195,247,${alpha})`
            ctx.lineWidth = 0.6
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw stars
      for (const s of stars) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(79,195,247,${s.opacity})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/constellation/
git commit -m "feat: add ConstellationCanvas with mouse-reactive starfield"
```

---

## Task 6: Click Ripple + Parallax Hook

**Files:**
- Create: `components/ui/ClickRipple.tsx`
- Create: `lib/hooks/useParallax.ts`
- Create: `lib/hooks/useMouseTilt.ts`

- [ ] **Step 1: Create ClickRipple**

Create `components/ui/ClickRipple.tsx`:

```tsx
'use client'
import { useEffect } from 'react'

const PARTICLE_COLORS = [
  'rgba(79,195,247,',
  'rgba(107,142,245,',
  'rgba(139,92,246,',
]

export function ClickRipple() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Ripple ring
      const ripple = document.createElement('div')
      ripple.style.cssText = `
        position:fixed;z-index:9999;border-radius:50%;pointer-events:none;
        left:${e.clientX - 30}px;top:${e.clientY - 30}px;
        width:60px;height:60px;
        background:rgba(79,195,247,0.12);
        border:1px solid rgba(79,195,247,0.35);
        transform:scale(0);
      `
      document.body.appendChild(ripple)
      ripple.animate(
        [{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(4)', opacity: 0 }],
        { duration: 600, easing: 'cubic-bezier(0,0.55,0.45,1)', fill: 'forwards' }
      ).addEventListener('finish', () => ripple.remove())

      // Particle burst
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const speed = 50 + Math.random() * 50
        const size = 2 + Math.random() * 3
        const col = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
        const p = document.createElement('div')
        p.style.cssText = `
          position:fixed;z-index:9999;border-radius:50%;pointer-events:none;
          width:${size}px;height:${size}px;
          background:${col}0.9);
          box-shadow:0 0 4px ${col}0.6);
          left:${e.clientX}px;top:${e.clientY}px;
          transform:translate(-50%,-50%);
        `
        document.body.appendChild(p)
        p.animate(
          [
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            {
              transform: `translate(calc(-50% + ${Math.cos(angle) * speed}px), calc(-50% + ${Math.sin(angle) * speed}px)) scale(0)`,
              opacity: 0,
            },
          ],
          { duration: 500 + Math.random() * 300, easing: 'cubic-bezier(0,0.55,0.45,1)', fill: 'forwards' }
        ).addEventListener('finish', () => p.remove())
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
```

- [ ] **Step 2: Create useParallax hook**

Create `lib/hooks/useParallax.ts`:

```ts
'use client'
import { useEffect, useRef } from 'react'

export function useParallax(speed = 0.15) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      const y = window.scrollY
      el.style.transform = `translateY(${y * -speed}px)`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])

  return ref
}
```

- [ ] **Step 3: Create useMouseTilt hook**

Create `lib/hooks/useMouseTilt.ts`:

```ts
'use client'
import { useEffect, useRef } from 'react'

export function useMouseTilt(maxDeg = 4) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const rx = ((e.clientY - cy) / cy) * maxDeg
      const ry = ((e.clientX - cx) / cx) * -maxDeg
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
      el.style.transition = 'transform 0.1s ease-out'
    }

    const onLeave = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
      el.style.transition = 'transform 0.4s ease-out'
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [maxDeg])

  return ref
}
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/ClickRipple.tsx lib/hooks/
git commit -m "feat: add click ripple/particles, parallax, and mouse tilt hooks"
```

---

## Task 7: Navbar + Footer + Layout

**Files:**
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `app/layout.tsx`

- [ ] **Step 1: Add logo SVG to public**

Create `public/logo.svg`:

```svg
<svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoG" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4FC3F7"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>
  <path d="M18 16 L18 52 Q18 66 30 68 Q42 70 46 58" stroke="url(#logoG)" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M40 16 L40 64" stroke="url(#logoG)" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M40 16 Q64 16 64 32 Q64 48 40 48" stroke="url(#logoG)" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M40 46 L64 66" stroke="url(#logoG)" stroke-width="9" stroke-linecap="round" fill="none"/>
</svg>
```

- [ ] **Step 2: Create Navbar**

Create `components/layout/Navbar.tsx`:

```tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/sessions', label: 'Sesiones 1:1' },
  { href: '/vault', label: 'Bóveda IA' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient topline */}
      <div className="h-[3px] bg-brand-grad" />

      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-bg/70 backdrop-blur-xl border-b border-white/[0.05]">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo.svg" alt="jairoromo.ai logo" width={36} height={36} priority />
          <span className="font-sora font-black text-[1rem] tracking-tight">
            jairo<span className="text-cyan">romo.ai</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-sora text-sm font-medium transition-colors duration-200',
                pathname === link.href ? 'text-white' : 'text-gray hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Button variant="primary" size="sm" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </nav>
    </header>
  )
}
```

Note: `asChild` requires adding Radix Slot support to Button, or simplify by wrapping the Link separately:

```tsx
// Alternative CTA without asChild:
<Link href="/login">
  <Button variant="primary" size="sm">Iniciar sesión</Button>
</Link>
```

Use the alternative (simpler, no extra dep).

- [ ] **Step 3: Create Footer**

Create `components/layout/Footer.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { SOCIAL_LINKS } from '@/lib/constants'

const FOOTER_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/sessions', label: 'Sesiones' },
  { href: '/vault', label: 'Bóveda IA' },
  { href: '/login', label: 'Acceder' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg2 py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="jairoromo.ai" width={32} height={32} />
              <span className="font-sora font-black text-sm">
                jairo<span className="text-cyan">romo.ai</span>
              </span>
            </Link>
            <p className="font-mono text-[11px] text-gray2 tracking-wider uppercase">
              IA sin fricción.
            </p>
          </div>

          {/* Nav */}
          <div className="flex flex-wrap gap-6">
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-sora text-sm text-gray2 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray2 hover:text-cyan hover:border-cyan/30 transition-all duration-200"
                aria-label={s.label}
              >
                <span className="text-xs font-mono font-bold">{s.label[0]}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.05] flex items-center justify-between">
          <span className="font-mono text-[11px] text-gray2">
            © {new Date().getFullYear()} Jairo Romo. Todos los derechos reservados.
          </span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#4FC3F7]" />
            <span className="font-mono text-[11px] text-gray2">jairoromo.ai</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Create root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ConstellationCanvas } from '@/components/constellation/ConstellationCanvas'
import { ClickRipple } from '@/components/ui/ClickRipple'

export const metadata: Metadata = {
  title: 'Jairo Romo — IA sin fricción',
  description: 'Consultor, builder y speaker en Inteligencia Artificial aplicada al mundo real. Sin teoría vacía. Sin promesas falsas.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jairoromo.ai'),
  openGraph: {
    title: 'Jairo Romo — IA sin fricción',
    description: 'IA aplicada al mundo real. Sesiones 1:1, proyectos y cursos.',
    url: 'https://jairoromo.ai',
    siteName: 'jairoromo.ai',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jairo Romo — IA sin fricción',
    description: 'IA aplicada al mundo real. Sesiones 1:1, proyectos y cursos.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen bg-bg text-white font-sora antialiased">
        <ConstellationCanvas />
        <ClickRipple />
        {/* Ambient orbs */}
        <div className="fixed top-[-150px] left-[-150px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(79,195,247,0.07),transparent_70%)] pointer-events-none z-[1]" />
        <div className="fixed bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06),transparent_70%)] pointer-events-none z-[1]" />
        <div className="relative z-10">
          <Navbar />
          <main className="pt-[67px]">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds. No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/layout/ public/logo.svg
git commit -m "feat: add Navbar, Footer, root layout with constellation and click effects"
```

---

## Task 8: Home Page — Hero Section

**Files:**
- Create: `components/home/HeroSection.tsx`
- Create: `components/home/SocialRow.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create SocialRow**

Create `components/home/SocialRow.tsx`:

```tsx
'use client'
import { SOCIAL_LINKS } from '@/lib/constants'

const ICONS: Record<string, React.ReactNode> = {
  tiktok: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  ),
  instagram: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  github: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
}

export function SocialRow() {
  return (
    <div className="flex flex-wrap gap-2.5 mt-6">
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray hover:text-white hover:border-cyan/25 transition-all duration-200 text-sm font-medium"
        >
          {ICONS[s.icon]}
          {s.label}
        </a>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create HeroSection**

Create `components/home/HeroSection.tsx`:

```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useParallax } from '@/lib/hooks/useParallax'
import { useMouseTilt } from '@/lib/hooks/useMouseTilt'
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { Button } from '@/components/ui/Button'
import { SocialRow } from './SocialRow'
import { HERO_TAGS } from '@/lib/constants'

export function HeroSection() {
  const leftRef = useParallax(0.12)
  const tiltRef = useMouseTilt(4)

  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-24">
      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* LEFT */}
        <div ref={leftRef} className="flex-1 will-change-transform">
          <EyebrowPill live className="mb-7">
            IA Aplicada al Mundo Real
          </EyebrowPill>

          <h1 className="font-sora font-black text-[clamp(2.8rem,5vw,4.5rem)] leading-[1.05] tracking-tight mb-5">
            Inteligencia<br />
            <span className="text-cyan">sin fricción.</span>
          </h1>

          <p className="font-sora font-light text-lg text-gray leading-relaxed max-w-[520px] mb-7">
            Construyo, enseño y escalo sistemas de IA para empresas reales.
            Sin teoría vacía, sin promesas falsas.
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {HERO_TAGS.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-gray2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/sessions">
              <Button variant="primary" size="lg">Agendar sesión</Button>
            </Link>
            <Link href="/vault">
              <Button variant="ghost" size="lg">Ver proyectos →</Button>
            </Link>
          </div>

          <SocialRow />
        </div>

        {/* RIGHT — Photo */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div ref={tiltRef} className="relative will-change-transform" style={{ width: 340, height: 340 }}>
            {/* Glow */}
            <div className="absolute inset-[-40px] rounded-full bg-[radial-gradient(circle,rgba(79,195,247,0.12),transparent_65%)] blur-2xl" />
            {/* Ring */}
            <div className="absolute inset-0 rounded-full bg-brand-grad z-0" />
            {/* Border */}
            <div className="absolute inset-[3px] rounded-full bg-bg z-[1]" />
            {/* Photo */}
            <div className="absolute inset-[9px] rounded-full overflow-hidden z-[2] bg-bg3">
              <Image
                src="/jairo-photo.png"
                alt="Jairo Romo"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            {/* Floating dots */}
            <span className="absolute top-[8%] right-[-6%] w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_#4FC3F7] animate-float z-[3]" />
            <span className="absolute bottom-[20%] left-[-5%] w-1.5 h-1.5 rounded-full bg-purp shadow-[0_0_8px_#8B5CF6] animate-float z-[3]" style={{ animationDelay: '2s' }} />
            <span className="absolute top-[55%] right-[-9%] w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#4FC3F7] animate-float z-[3]" style={{ animationDelay: '1s' }} />
          </div>
          <div className="mt-4 font-mono text-[12px] text-cyan tracking-[3px] uppercase">
            @jairoromo.ai
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-[linear-gradient(to_bottom,rgba(79,195,247,0.4),transparent)] animate-scroll-hint" />
        <span className="font-mono text-[10px] text-gray2 tracking-[3px] uppercase">scroll</span>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Update app/page.tsx**

```tsx
import { HeroSection } from '@/components/home/HeroSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
    </>
  )
}
```

- [ ] **Step 4: Add jairo-photo.png to public/**

Place user's photo PNG at `public/jairo-photo.png` (transparent background, portrait crop).

- [ ] **Step 5: Test in browser**

```bash
npm run dev
```

Navigate to http://localhost:3000. Verify: constellation visible, hero split layout renders, photo circular with gradient ring, mouse tilt on photo, scroll parallax on text, click ripples on click.

- [ ] **Step 6: Commit**

```bash
git add components/home/HeroSection.tsx components/home/SocialRow.tsx app/page.tsx public/jairo-photo.png
git commit -m "feat: add hero section with split layout, photo, parallax, and social row"
```

---

## Task 9: Home Page — Stats Bar + Remaining Sections

**Files:**
- Create: `components/home/StatsBar.tsx`
- Create: `components/home/ExperienceTimeline.tsx`
- Create: `components/home/CollabCTA.tsx`
- Create: `components/home/DonationSection.tsx`
- Create: `components/home/ContactForm.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create StatsBar**

Create `components/home/StatsBar.tsx`:

```tsx
import { HERO_STATS } from '@/lib/constants'

export function StatsBar() {
  return (
    <section className="relative z-10 border-y border-white/[0.06] bg-bg2/60 backdrop-blur-sm py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="font-sora font-black text-2xl text-cyan">{stat.value}</span>
            <span className="font-mono text-[11px] uppercase tracking-[2px] text-gray2">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create ExperienceTimeline**

Create `components/home/ExperienceTimeline.tsx`:

```tsx
const TIMELINE = [
  {
    year: '2022',
    title: 'Inicio en IA aplicada',
    desc: 'Primeros 1,000 horas experimentando con modelos de lenguaje, automatizaciones y herramientas emergentes. Sin manual. A prueba y error.',
  },
  {
    year: '2023',
    title: 'Primeros proyectos reales',
    desc: 'Implementación de sistemas RAG, pipelines de automatización y agentes para empresas en México y Latinoamérica.',
  },
  {
    year: '2024',
    title: 'Speaker y consultor',
    desc: 'Conferencias, talleres presenciales y consultoría estratégica de IA para equipos directivos y startups.',
  },
  {
    year: '2025',
    title: 'Plataforma y comunidad',
    desc: 'Lanzamiento de cursos, sesiones 1:1 y bóveda de proyectos open. +5K personas siguiendo el camino.',
  },
]

export function ExperienceTimeline() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-4">
          Trayectoria
        </div>
        <h2 className="font-sora font-black text-3xl md:text-4xl mb-16 leading-tight">
          El camino hasta aquí.
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[72px] top-0 bottom-0 w-px bg-white/[0.07]" />

          <div className="flex flex-col gap-12">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-[72px] text-right">
                  <span className="font-mono text-sm font-bold text-cyan">{item.year}</span>
                </div>
                {/* Dot */}
                <div className="flex-shrink-0 relative mt-1">
                  <div className="w-3 h-3 rounded-full bg-bg2 border-2 border-cyan shadow-[0_0_8px_rgba(79,195,247,0.5)]" />
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="font-sora font-bold text-lg mb-2">{item.title}</h3>
                  <p className="font-sora font-light text-gray text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create CollabCTA**

Create `components/home/CollabCTA.tsx`:

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CollabCTA() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/[0.07] bg-bg2/80 p-12 md:p-16 text-center">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-5">
            Colaboraciones
          </div>
          <h2 className="font-sora font-black text-3xl md:text-5xl font-light leading-tight mb-5">
            ¿Tienes un proyecto<br />
            <span className="text-cyan">que vale la pena?</span>
          </h2>
          <p className="font-sora text-gray text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Conferencias, workshops, alianzas estratégicas o consultoría de alto nivel.
            Si el proyecto es serio, encontramos la forma.
          </p>
          <Link href="/#contacto">
            <Button variant="primary" size="lg">Proponer colaboración</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create DonationSection**

Create `components/home/DonationSection.tsx`:

```tsx
import { Button } from '@/components/ui/Button'

// Replace STRIPE_DONATION_LINK with your actual Stripe Payment Link URL
// Create at: https://dashboard.stripe.com/payment-links
const STRIPE_DONATION_LINK = 'https://buy.stripe.com/REPLACE_WITH_YOUR_LINK'

export function DonationSection() {
  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[3px] text-cyan mb-4">
          Apoya el trabajo
        </div>
        <h2 className="font-sora font-black text-2xl md:text-3xl mb-4">
          El contenido es gratuito.
        </h2>
        <p className="font-sora text-gray leading-relaxed mb-8">
          Si algo de lo que comparto te ha sido útil, puedes contribuir libremente.
          Sin monto mínimo, sin obligación.
        </p>
        <a href={STRIPE_DONATION_LINK} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="md">Hacer una contribución</Button>
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create ContactForm**

Create `components/home/ContactForm.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', company: '', whatsapp: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Nombre requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setState('loading')
    const supabase = createClient()
    const { error } = await supabase.from('contact_submissions').insert([form])
    setState(error ? 'error' : 'success')
  }

  if (state === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" fill="none" stroke="#4FC3F7" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <h3 className="font-sora font-bold text-xl mb-2">Mensaje recibido</h3>
        <p className="font-sora text-gray">Me pondré en contacto pronto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input
        id="name" label="Nombre" placeholder="Tu nombre completo"
        value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
        error={errors.name}
      />
      <Input
        id="email" label="Email" type="email" placeholder="tu@empresa.com"
        value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
        error={errors.email}
      />
      <Input
        id="company" label="Empresa" placeholder="Nombre de tu empresa"
        value={form.company} onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
      />
      <Input
        id="whatsapp" label="WhatsApp / Teléfono" placeholder="+52 55 1234 5678"
        value={form.whatsapp} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))}
      />
      <div className="md:col-span-2 flex flex-col gap-3 items-start">
        <Button type="submit" variant="primary" loading={state === 'loading'}>
          Enviar mensaje
        </Button>
        {state === 'error' && (
          <p className="font-mono text-[11px] text-red-400">Error al enviar. Intenta de nuevo.</p>
        )}
      </div>
    </form>
  )
}
```

- [ ] **Step 6: Assemble full app/page.tsx**

```tsx
import { HeroSection } from '@/components/home/HeroSection'
import { StatsBar } from '@/components/home/StatsBar'
import { ExperienceTimeline } from '@/components/home/ExperienceTimeline'
import { CollabCTA } from '@/components/home/CollabCTA'
import { DonationSection } from '@/components/home/DonationSection'
import { ContactForm } from '@/components/home/ContactForm'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <ExperienceTimeline />
      <CollabCTA />
      <DonationSection />

      {/* Contact */}
      <section id="contacto" className="py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <EyebrowPill className="mb-6">Contacto</EyebrowPill>
          <h2 className="font-sora font-black text-3xl md:text-4xl mb-4">
            Hablemos.
          </h2>
          <p className="font-sora text-gray mb-12">
            Para propuestas de colaboración, eventos o proyectos de alto impacto.
          </p>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 7: Test full home page**

```bash
npm run dev
```

Navigate to http://localhost:3000. Scroll through all sections. Fill and submit contact form (check Supabase dashboard for the row).

- [ ] **Step 8: Commit**

```bash
git add components/home/ app/page.tsx
git commit -m "feat: complete home page with stats, timeline, collab CTA, donation, and contact form"
```

---

## Task 10: Auth Pages

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/signup/page.tsx`
- Create: `app/api/auth/callback/route.ts`

- [ ] **Step 1: Enable OAuth in Supabase**

In Supabase dashboard: Authentication > Providers > Google. Enable and add your Google OAuth credentials. Set redirect URL to `http://localhost:3000/api/auth/callback`.

- [ ] **Step 2: Create auth callback route**

Create `app/api/auth/callback/route.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
```

- [ ] **Step 3: Create Login page**

Create `app/login/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword(form)
    setLoading(false)
    if (authError) { setError(authError.message); return }
    router.push('/')
    router.refresh()
  }

  const onGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <EyebrowPill className="mb-5">Acceder</EyebrowPill>
          <h1 className="font-sora font-black text-3xl mb-2">Bienvenido de vuelta.</h1>
          <p className="font-sora text-gray text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-cyan hover:underline">Regístrate</Link>
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-bg2/80 backdrop-blur-sm p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Input
              id="email" label="Email" type="email" placeholder="tu@correo.com"
              value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              id="password" label="Contraseña" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            />
            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Iniciar sesión
            </Button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="font-mono text-[11px] text-gray2 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <Button variant="ghost" onClick={onGoogle} className="w-full">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4FC3F7" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#8B5CF6" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#6B8EF5" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#4FC3F7" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create Signup page**

Create `app/signup/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" fill="none" stroke="#4FC3F7" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <h2 className="font-sora font-black text-2xl mb-3">Revisa tu email</h2>
          <p className="font-sora text-gray">Enviamos un enlace de confirmación a <strong className="text-white">{form.email}</strong></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <EyebrowPill className="mb-5">Registro</EyebrowPill>
          <h1 className="font-sora font-black text-3xl mb-2">Crea tu cuenta.</h1>
          <p className="font-sora text-gray text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-cyan hover:underline">Inicia sesión</Link>
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-bg2/80 backdrop-blur-sm p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Input
              id="name" label="Nombre completo" placeholder="Tu nombre"
              value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
            />
            <Input
              id="email" label="Email" type="email" placeholder="tu@correo.com"
              value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              id="password" label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"
              value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            />
            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Crear cuenta
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Test auth flow**

```bash
npm run dev
```

1. Go to http://localhost:3000/signup, create account, verify email arrives.
2. Go to http://localhost:3000/login, sign in. Verify redirect to `/`.
3. Check Supabase dashboard: Authentication > Users — user should appear.

- [ ] **Step 6: Commit**

```bash
git add app/login/ app/signup/ app/api/auth/
git commit -m "feat: add login, signup pages with Supabase Auth and Google OAuth"
```

---

## Task 11: Sessions Page

**Files:**
- Create: `components/sessions/SessionCard.tsx`
- Create: `components/sessions/CalEmbed.tsx`
- Create: `app/sessions/page.tsx`
- Create: `app/sessions/success/page.tsx`
- Create: `app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Create Stripe products in dashboard**

Go to https://dashboard.stripe.com/products. Create 3 products:
- "Enfoque Rápido 20min" — $15 USD (one-time). Copy price ID → `SESSION_PACKAGES[0].stripePriceId` in constants.ts
- "Sesión de Trabajo 45min" — $79 USD (one-time). Copy price ID → `SESSION_PACKAGES[1].stripePriceId`
- "Consultoría Profunda 90min" — $297 USD (one-time). Copy price ID → `SESSION_PACKAGES[2].stripePriceId`

Update `lib/constants.ts` with the real `stripePriceId` values.

- [ ] **Step 2: Create Stripe server instance**

Create `lib/stripe.ts`:

```ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
})
```

Install: `npm install stripe`

- [ ] **Step 3: Create checkout API route**

Create `app/api/stripe/checkout/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { SESSION_PACKAGES } from '@/lib/constants'

export async function POST(request: Request) {
  const { packageId } = await request.json()

  const pkg = SESSION_PACKAGES.find((p) => p.id === packageId)
  if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
  if (!pkg.stripePriceId) return NextResponse.json({ error: 'Price not configured' }, { status: 400 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
    success_url: `${siteUrl}/sessions/success?session_id={CHECKOUT_SESSION_ID}&pkg=${pkg.id}`,
    cancel_url: `${siteUrl}/sessions`,
    metadata: { packageId: pkg.id, calLink: pkg.calLink },
  })

  return NextResponse.json({ url: session.url })
}
```

- [ ] **Step 4: Create SessionCard**

Create `components/sessions/SessionCard.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { SESSION_PACKAGES } from '@/lib/constants'

type Package = typeof SESSION_PACKAGES[number]

export function SessionCard({ pkg }: { pkg: Package }) {
  const [loading, setLoading] = useState(false)

  const onBuy = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: pkg.id }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-8 transition-all duration-300',
        pkg.popular
          ? 'border-cyan/40 bg-cyan/[0.04] shadow-[0_0_40px_rgba(79,195,247,0.08)]'
          : 'border-white/[0.07] bg-bg2/60 hover:border-white/[0.14]'
      )}
    >
      {pkg.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[2px] bg-brand-grad text-white px-4 py-1.5 rounded-full">
            Más popular
          </span>
        </div>
      )}

      <div className="font-mono text-[11px] font-bold uppercase tracking-[2.5px] text-cyan mb-4">
        {pkg.duration}
      </div>

      <h3 className="font-sora font-black text-2xl mb-3">{pkg.name}</h3>

      <p className="font-sora text-gray text-sm leading-relaxed flex-1 mb-6">{pkg.pitch}</p>

      <p className="font-mono text-[11px] text-gray2 mb-8 leading-relaxed">
        {pkg.notFor}
      </p>

      <div className="flex items-end gap-1 mb-8">
        <span className="font-sora font-black text-4xl">${pkg.price}</span>
        <span className="font-mono text-sm text-gray2 mb-1.5">{pkg.currency}</span>
      </div>

      <Button
        variant={pkg.popular ? 'primary' : 'ghost'}
        loading={loading}
        onClick={onBuy}
        className="w-full"
      >
        Agendar sesión
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Create CalEmbed**

Create `components/sessions/CalEmbed.tsx`:

```tsx
'use client'
import { useEffect } from 'react'

export function CalEmbed({ calLink }: { calLink: string }) {
  useEffect(() => {
    // Load Cal.com embed script
    const script = document.createElement('script')
    script.src = 'https://asset.cal.com/embed/embed.js'
    script.async = true
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-bg2/60 overflow-hidden">
      <iframe
        src={`${calLink}?embed=true&theme=dark`}
        className="w-full min-h-[600px]"
        frameBorder="0"
        title="Agendar sesión"
      />
    </div>
  )
}
```

- [ ] **Step 6: Create sessions page**

Create `app/sessions/page.tsx`:

```tsx
import { EyebrowPill } from '@/components/ui/EyebrowPill'
import { SessionCard } from '@/components/sessions/SessionCard'
import { SESSION_PACKAGES } from '@/lib/constants'

export const metadata = {
  title: 'Sesiones 1:1 — jairoromo.ai',
  description: 'Trabaja directamente con Jairo Romo. Elige el formato que mejor se adapta a tu necesidad.',
}

export default function SessionsPage() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <EyebrowPill live className="mb-6">Sesiones 1:1</EyebrowPill>
          <h1 className="font-sora font-black text-4xl md:text-5xl mb-5 leading-tight">
            Trabaja directamente<br />conmigo.
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl mx-auto">
            Elige el formato que mejor se adapta a lo que necesitas.
            Todas las sesiones son por videollamada, en español.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SESSION_PACKAGES.map((pkg) => (
            <SessionCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="font-mono text-[11px] text-gray2 uppercase tracking-wider">
            Pago seguro con Stripe · Sin suscripción · Factura disponible
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create sessions success page**

Create `app/sessions/success/page.tsx`:

```tsx
import { Suspense } from 'react'
import { CalEmbed } from '@/components/sessions/CalEmbed'
import { SESSION_PACKAGES } from '@/lib/constants'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

function SuccessContent({ searchParams }: { searchParams: { pkg?: string } }) {
  const pkg = SESSION_PACKAGES.find((p) => p.id === searchParams.pkg)

  if (!pkg) {
    return (
      <div className="text-center py-24">
        <p className="text-gray">Sesión no encontrada. Revisa tu email de confirmación.</p>
      </div>
    )
  }

  return (
    <div className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" fill="none" stroke="#4FC3F7" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <EyebrowPill className="mb-5">Pago confirmado</EyebrowPill>
          <h1 className="font-sora font-black text-3xl md:text-4xl mb-4">
            ¡Listo! Elige tu horario.
          </h1>
          <p className="font-sora text-gray">
            Tu <strong className="text-white">{pkg.name}</strong> está pagada.
            Selecciona el día y hora que mejor te funcione.
          </p>
        </div>
        <CalEmbed calLink={pkg.calLink} />
      </div>
    </div>
  )
}

export default function SessionsSuccessPage({
  searchParams,
}: {
  searchParams: { pkg?: string; session_id?: string }
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray">Cargando...</span></div>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  )
}
```

- [ ] **Step 8: Test sessions flow**

```bash
npm run dev
```

1. Go to http://localhost:3000/sessions — 3 cards should render.
2. Click "Agendar sesión" on any card. Should redirect to Stripe Checkout.
3. Use Stripe test card `4242 4242 4242 4242`, any future date, any CVC.
4. After payment: redirect to `/sessions/success?pkg=...` — Cal.com embed should appear.

- [ ] **Step 9: Commit**

```bash
git add components/sessions/ app/sessions/ app/api/stripe/ lib/stripe.ts
git commit -m "feat: add sessions page with Stripe checkout and Cal.com post-payment embed"
```

---

## Task 12: AI Vault Page

**Files:**
- Create: `components/vault/ProjectCard.tsx`
- Create: `components/vault/FilterBar.tsx`
- Create: `app/vault/page.tsx`

- [ ] **Step 1: Seed sample projects in Supabase**

In Supabase SQL Editor:

```sql
insert into public.projects (title, description, category, tech_stack, demo_url, repo_url, featured)
values
  ('Pipeline RAG para Documentos Legales', 'Sistema de recuperación aumentada que procesa contratos y los hace consultables en lenguaje natural.', 'rags', ARRAY['LangChain', 'Pinecone', 'GPT-4', 'FastAPI'], null, null, true),
  ('Automatización de Reportes con N8N + LLM', 'Pipeline que extrae datos de múltiples fuentes, los resume con un LLM y envía reporte ejecutivo diario.', 'automatizaciones', ARRAY['N8N', 'Claude', 'PostgreSQL', 'Slack API'], null, null, false),
  ('Agente de Atención al Cliente', 'Agente conversacional entrenado con base de conocimiento interna. 70% de deflección de tickets.', 'llms', ARRAY['OpenAI', 'Supabase', 'Next.js', 'Vercel'], null, null, true),
  ('Clasificador de Imágenes Industriales', 'Modelo de ML fine-tuned para detección de defectos en línea de producción. 97% de precisión.', 'ml', ARRAY['PyTorch', 'YOLO v8', 'FastAPI', 'Docker'], null, null, false);
```

- [ ] **Step 2: Create FilterBar**

Create `components/vault/FilterBar.tsx`:

```tsx
'use client'
import { cn } from '@/lib/utils'
import { VAULT_CATEGORIES } from '@/lib/constants'

interface FilterBarProps {
  active: string
  onChange: (cat: string) => void
}

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {VAULT_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'font-mono text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-lg transition-all duration-200',
            active === cat.id
              ? 'bg-cyan text-bg shadow-[0_0_16px_rgba(79,195,247,0.35)]'
              : 'bg-white/[0.04] border border-white/[0.08] text-gray2 hover:border-cyan/25 hover:text-white'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create ProjectCard**

Create `components/vault/ProjectCard.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface Project {
  id: string
  title: string
  description: string
  category: string
  tech_stack: string[]
  demo_url: string | null
  repo_url: string | null
  featured: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  automatizaciones: 'Automatización',
  ml: 'Machine Learning',
  llms: 'LLMs',
  rags: 'RAG',
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-all duration-300 group',
        project.featured
          ? 'border-cyan/25 bg-bg2/80'
          : 'border-white/[0.07] bg-bg2/40 hover:border-white/[0.12]'
      )}
    >
      {project.featured && (
        <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#4FC3F7]" />
      )}

      <div className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-cyan bg-cyan/[0.07] border border-cyan/[0.15] px-3 py-1 rounded-full w-fit mb-4">
        {CATEGORY_LABELS[project.category] || project.category}
      </div>

      <h3 className="font-sora font-bold text-lg mb-3 leading-snug">{project.title}</h3>
      <p className="font-sora text-gray text-sm leading-relaxed flex-1 mb-5">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {project.tech_stack.map((tech) => (
          <span key={tech} className="font-mono text-[10px] text-gray2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-md">
            {tech}
          </span>
        ))}
      </div>

      {(project.demo_url || project.repo_url) && (
        <div className="flex gap-3 mt-auto">
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan hover:underline">
              Demo →
            </a>
          )}
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray2 hover:text-white">
              Código →
            </a>
          )}
        </div>
      )}
    </article>
  )
}
```

- [ ] **Step 4: Create Vault page**

Create `app/vault/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { VaultClient } from './VaultClient'
import { EyebrowPill } from '@/components/ui/EyebrowPill'

export const metadata = {
  title: 'Bóveda IA — jairoromo.ai',
  description: 'Proyectos reales desarrollados con Inteligencia Artificial. RAG, automatizaciones, LLMs, ML.',
}

export default async function VaultPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <EyebrowPill className="mb-6">Bóveda IA</EyebrowPill>
          <h1 className="font-sora font-black text-4xl md:text-5xl mb-5 leading-tight">
            Proyectos reales.<br />
            <span className="text-cyan">Resultados medibles.</span>
          </h1>
          <p className="font-sora text-gray text-lg max-w-2xl">
            Sistemas de IA implementados en producción para empresas reales.
            No demos. No teoría.
          </p>
        </div>

        <VaultClient projects={projects || []} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create VaultClient for client-side filtering**

Create `app/vault/VaultClient.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { FilterBar } from '@/components/vault/FilterBar'
import { ProjectCard } from '@/components/vault/ProjectCard'

interface Project {
  id: string
  title: string
  description: string
  category: string
  tech_stack: string[]
  demo_url: string | null
  repo_url: string | null
  featured: boolean
}

export function VaultClient({ projects }: { projects: Project[] }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  return (
    <>
      <div className="mb-10">
        <FilterBar active={activeFilter} onChange={setActiveFilter} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray font-sora">
          No hay proyectos en esta categoría todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 6: Test vault**

```bash
npm run dev
```

Go to http://localhost:3000/vault. Verify projects from Supabase render. Click filter buttons — verify filtering works client-side.

- [ ] **Step 7: Commit**

```bash
git add components/vault/ app/vault/
git commit -m "feat: add AI Vault page with Supabase data, filter bar, and project cards"
```

---

## Task 13: Final Polish + Vercel Deploy

**Files:**
- Modify: `next.config.ts`
- Create: `.gitignore` additions
- Create: `vercel.json` (if needed)

- [ ] **Step 1: Add .gitignore entries**

Verify `.gitignore` contains:
```
.env.local
.env*.local
.next/
node_modules/
```

- [ ] **Step 2: Full build check**

```bash
npm run build
```

Expected: Build completes with no errors. Note any TypeScript errors and fix before proceeding.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Fix any ESLint errors.

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel --prod
```

Or connect repo via https://vercel.com/new. Import `jairormoai-site` repo.

Add all env vars from `.env.local` in Vercel project settings under "Environment Variables".

Set `NEXT_PUBLIC_SITE_URL` to your actual Vercel URL (e.g., `https://jairoromo.ai`).

- [ ] **Step 5: Configure Stripe webhook for production**

In Stripe dashboard: Developers > Webhooks > Add endpoint.
- URL: `https://jairoromo.ai/api/stripe/webhook` (or your Vercel URL)
- Events: `checkout.session.completed`
- Copy signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel env vars.

- [ ] **Step 6: Configure Supabase Auth redirect URL for production**

In Supabase: Authentication > URL Configuration.
- Site URL: `https://jairoromo.ai`
- Redirect URLs: add `https://jairoromo.ai/api/auth/callback`

- [ ] **Step 7: Final verification**

Visit production URL. Verify:
- [ ] Constellation renders and responds to mouse
- [ ] Click ripples work
- [ ] Navbar logo and brand appear
- [ ] Home page all sections visible
- [ ] Sessions page loads, Stripe checkout works (use test mode)
- [ ] Vault page loads projects
- [ ] Login / Signup flows work
- [ ] Mobile responsive on iPhone-sized viewport

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "feat: Phase 1 complete — Home, Auth, Sessions, AI Vault"
```

---

## Self-Review

**Spec coverage check:**
- [x] Home — hero split, stats, timeline, collab CTA, donation, contact form
- [x] Sessions — 3 packages, Stripe checkout, Cal.com post-payment reveal
- [x] AI Vault — Supabase data, filter bar, project cards
- [x] Auth — email/password + Google OAuth, Supabase session
- [x] Brand system — colors, Sora/Space Mono, constellation canvas, click effects, parallax
- [x] Stats: 50+ / 5K+ / +3000hrs / Desde 2022 / 2 cursos
- [x] Social: TikTok / Instagram / YouTube / GitHub @jairoromo.ai
- [x] Session prices: $15 / $79 / $297 USD
- [x] Logo SVG inline
- [x] Photo circular with gradient ring

**Placeholder scan:** No TBDs found. One note: `STRIPE_DONATION_LINK` in DonationSection.tsx must be replaced with real Stripe Payment Link URL before going live.

**Type consistency:** `Project` interface defined in VaultClient.tsx and ProjectCard.tsx — keep in sync. Recommend extracting to `lib/types.ts` if needed.
