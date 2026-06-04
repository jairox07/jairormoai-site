export interface Project {
  id: string
  title: string
  description: string
  category: string
  tech_stack: string[]
  demo_url: string | null
  repo_url: string | null
  featured: boolean
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
  progress: Record<string, string> // { lessonId: completed_at ISO string }
  enrolled_at: string
}
