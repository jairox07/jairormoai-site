import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization - Supabase client is created when first needed
let supabase: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!supabase) {
    const url = import.meta.env['VITE_SUPABASE_URL'];
    const key = import.meta.env['VITE_SUPABASE_ANON_KEY'];

    if (!url || !key) {
      console.warn('Supabase env vars not set. Auth will not work.');
      return null;
    }

    supabase = createClient(url, key);
  }
  return supabase;
};

interface AuthUser {
  id:       string;
  email:    string;
  fullName: string;
  role:     string;
  tenantId: string;
}

interface AuthState {
  user:        AuthUser | null;
  accessToken: string | null;
  isLoading:   boolean;
  login:       (email: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
  refresh:     () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const client = getSupabaseClient();
          if (!client) throw new Error('Supabase not configured');
          const { data, error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw new Error(error.message);
          set({
            accessToken: data.session?.access_token ?? null,
            user: data.user ? {
              id:       data.user.id,
              email:    data.user.email ?? '',
              fullName: data.user.user_metadata?.['full_name'] ?? '',
              role:     data.user.user_metadata?.['role'] ?? 'lawyer',
              tenantId: data.user.user_metadata?.['tenant_id'] ?? '',
            } : null,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const client = getSupabaseClient();
        if (client) await client.auth.signOut();
        set({ user: null, accessToken: null });
      },

      refresh: async () => {
        const client = getSupabaseClient();
        if (!client) return;
        const { data } = await client.auth.getSession();
        if (data.session) {
          set({ accessToken: data.session.access_token });
        } else {
          set({ user: null, accessToken: null });
        }
      },
    }),
    { name: 'lexos-auth', partialize: (s) => ({ accessToken: s.accessToken, user: s.user }) },
  ),
);
