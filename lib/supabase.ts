import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseAnonKey;

export const supabase: SupabaseClient = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
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
