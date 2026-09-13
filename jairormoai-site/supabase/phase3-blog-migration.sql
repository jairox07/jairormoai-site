-- ============================================================
-- jairoromo.ai — Phase 3: Blog / Newsletter Archive Migration
-- Run this in Supabase SQL Editor BEFORE deploying the blog.
-- ============================================================

-- Make sure the newsletter table exists (the /api/newsletter route
-- already writes to it; this is here so a fresh project has it too).
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  resend_synced boolean default false,
  created_at timestamptz default now()
);

-- Blog posts: PUBLIC metadata + teaser only. This is what anyone,
-- logged in or not, can read — used for the listing page, search,
-- and the free preview shown to non-subscribers.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,          -- 2-3 sentence teaser, always public
  cover_image_url text,
  tags text[] default '{}',
  newsletter_number integer,       -- links back to the Resend broadcast, if any
  session_focus text default 'enfoque-rapido', -- which SESSION_PACKAGES id the CTA emphasizes
  published boolean default false,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Full post body — kept in a SEPARATE table on purpose. RLS on this
-- table requires a logged-in user, so the full text never reaches
-- an anonymous request even if someone reads the API response
-- directly (unlike hiding a column client-side, which doesn't
-- protect anything).
create table if not exists public.post_content (
  post_id uuid primary key references public.posts(id) on delete cascade,
  body_html text not null
);

alter table public.newsletter_subscribers enable row level security;
alter table public.posts enable row level security;
alter table public.post_content enable row level security;

-- newsletter_subscribers: no public read/write policy — only the
-- service role (used server-side in /api/newsletter) touches this.

-- posts: anyone can read published posts (metadata + teaser only)
drop policy if exists "posts: public read" on public.posts;
create policy "posts: public read"
  on public.posts for select
  using (published = true);

-- post_content: only logged-in users can read, and only for posts
-- that are actually published (defense in depth).
drop policy if exists "post_content: logged-in users read" on public.post_content;
create policy "post_content: logged-in users read"
  on public.post_content for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from public.posts p
      where p.id = post_content.post_id and p.published = true
    )
  );

create index if not exists posts_published_idx on public.posts (published, published_at desc);
create index if not exists posts_tags_idx on public.posts using gin (tags);
