import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseAnonKey;

// Custom storage adapter to handle "Remember Me" functionality
const hybridStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    // Check preference
    const rememberMe = window.localStorage.getItem('techverse_remember_me') !== 'false';
    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(key, value);

    // Clear the other one to avoid conflicts
    const other = rememberMe ? window.sessionStorage : window.localStorage;
    other.removeItem(key);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: hybridStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export const isSupabaseConfigured = () => isConfigured;

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  codeExample: string;
  tryStarter: string;
  language: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  order?: number;
}

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: string;
  solution: string;
  hints: string;
  language: string;
}

export interface TestCase {
  id: string;
  problem_id: string;
  input: string;
  output: string;
  hidden: boolean;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  status: 'passed' | 'failed';
  attempts: number;
  created_at: string;
}
