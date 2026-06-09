export interface Project {
  id: string
  title: string
  description: string
  long_description: string | null
  category: string
  tech_stack: string[]
  demo_url: string | null
  repo_url: string | null
  download_url: string | null
  featured: boolean
  is_free: boolean
  price_cents: number
  thumbnail_url: string | null
  created_at: string
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string | null
  thumbnail_url: string | null
  price_cents: number
  stripe_price_id: string
  published: boolean
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  mux_asset_id: string | null
  mux_playback_id: string | null
  order_index: number
  duration_seconds: number | null
  downloadable_url: string | null
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  stripe_session_id: string | null
  progress: Record<string, string>
  enrolled_at: string
}

export interface Comment {
  id: string
  user_id: string
  project_id: string | null
  course_id: string | null
  content: string
  created_at: string
  profiles?: { full_name: string | null }
}

export interface ActivityLog {
  id: string
  user_id: string | null
  event_type: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}
