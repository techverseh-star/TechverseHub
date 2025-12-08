import { supabase } from './supabase';
import type { Lesson, PracticeProblem } from './supabase';
export type { Lesson, PracticeProblem };
import { cache } from 'react';

// --- Interfaces ---

// Language interface (local definition as it's not in lib/supabase.ts)
export interface Language {
    id: string;
    name: string;
    color: string;
    description: string;
    lessons_count: number;
    prefix: string;
}

// Project Interface (matching data/projects.ts structure)
export interface Project {
    id: string;
    language: string; // "python", not "language_id"
    title: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    description: string;
    overview: string;
    concepts: string[];
    steps: { title: string; description: string }[];
    starterCode: string; // camelCase
    solution: string;    // camelCase "solution" in projects.ts, "solution_code" in DB?
}

// --- Fetch Functions ---

export const getLanguages = cache(async (): Promise<Language[]> => {
    const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching languages:', error);
        return [];
    }
    return data || [];
});

export const getLanguageById = cache(async (id: string): Promise<Language | null> => {
    const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
});

export const getLessons = cache(async (languageId?: string): Promise<Lesson[]> => {
    let query = supabase.from('lessons').select('*').order('order');

    if (languageId) {
        query = query.eq('language_id', languageId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching lessons:', error);
        return [];
    }

    // Map DB (snake_case) to App (camelCase)
    return (data || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        content: l.content,
        codeExample: l.code_example,  // MAP
        tryStarter: l.try_starter,    // MAP
        language: l.language,         // legacy column
        order: l.order,
        // 'level' is optional in interface, not in DB currently?
    }));
});

export const getLessonById = cache(async (id: string): Promise<Lesson | null> => {
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;

    return {
        id: data.id,
        title: data.title,
        content: data.content,
        codeExample: data.code_example,
        tryStarter: data.try_starter,
        language: data.language,
        order: data.order,
    };
});

export const getProblems = cache(async (languageId?: string): Promise<PracticeProblem[]> => {
    let query = supabase.from('practice_problems').select('*');

    if (languageId) {
        query = query.eq('language_id', languageId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching problems:', error);
        return [];
    }

    // Interface PracticeProblem: { id, title, difficulty, description, examples, solution, hints, language }
    // DB practice_problems: { id, title, difficulty, description, examples, solution, hints, language_id, language }

    return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        description: p.description,
        examples: p.examples,
        solution: p.solution,
        hints: p.hints,
        language: p.language // string
    }));
});

export const getProblemById = cache(async (id: string): Promise<PracticeProblem | null> => {
    const { data, error } = await supabase
        .from('practice_problems')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;

    return {
        id: data.id,
        title: data.title,
        difficulty: data.difficulty,
        description: data.description,
        examples: data.examples,
        solution: data.solution,
        hints: data.hints,
        language: data.language
    };
});

export const getProjects = cache(async (languageId?: string): Promise<Project[]> => {
    let query = supabase.from('projects').select('*');

    if (languageId) {
        query = query.eq('language_id', languageId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    // Map DB snake_case -> Project camelCase
    return (data || []).map((p: any) => ({
        id: p.id,
        language: p.language,
        title: p.title,
        difficulty: p.difficulty,
        duration: p.duration,
        description: p.description,
        overview: p.overview,
        concepts: p.concepts,
        steps: p.steps,
        starterCode: p.starter_code, // MAP
        solution: p.solution_code    // MAP
    }));
});

export const getProjectById = cache(async (id: string): Promise<Project | null> => {
    // Cast ID to text just in case, though DB check verified it's text now.
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;

    return {
        id: data.id,
        language: data.language,
        title: data.title,
        difficulty: data.difficulty,
        duration: data.duration,
        description: data.description,
        overview: data.overview,
        concepts: data.concepts,
        steps: data.steps,
        starterCode: data.starter_code, // MAP
        solution: data.solution_code    // MAP
    };
});
