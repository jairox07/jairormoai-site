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
