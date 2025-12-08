import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// --- 1. Environment Loading ---
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach((line) => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
                }
            });
            console.log("Loaded .env.local");
        } else {
            console.warn("Warning: .env.local not found.");
        }
    } catch (e) {
        console.error("Error loading .env.local", e);
    }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: Missing keys. check .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// --- 2. Data Sources ---

// LANGUAGES (from constants.tsx - simplified)
const LANGUAGES = [
    { id: "python", name: "Python", color: "blue", prefix: "py-", lessons: 15, description: "Beginner-friendly, versatile language" },
    { id: "javascript", name: "JavaScript", color: "yellow", prefix: "js-", lessons: 15, description: "The language of the web" },
    { id: "typescript", name: "TypeScript", color: "blue", prefix: "ts-", lessons: 8, description: "JavaScript with static types" },
    { id: "java", name: "Java", color: "orange", prefix: "java-", lessons: 8, description: "Enterprise & Android development" },
    { id: "c", name: "C", color: "gray", prefix: "c-", lessons: 10, description: "Foundation of modern programming" },
    { id: "cpp", name: "C++", color: "purple", prefix: "cpp-", lessons: 10, description: "High-performance systems & games" },
    { id: "html", name: "HTML", color: "orange", prefix: "html-", lessons: 5, description: "Structure of web pages" },
    { id: "css", name: "CSS", color: "blue", prefix: "css-", lessons: 5, description: "Styling of web pages" },
    { id: "php", name: "PHP", color: "purple", prefix: "php-", lessons: 5, description: "Server-side scripting" },
    { id: "ruby", name: "Ruby", color: "red", prefix: "rb-", lessons: 5, description: "Productive and elegant" },
    { id: "sql", name: "SQL", color: "blue", prefix: "sql-", lessons: 5, description: "Database management" },
    { id: "swift", name: "Swift", color: "orange", prefix: "swift-", lessons: 5, description: "iOS and macOS development" },
    { id: "kotlin", name: "Kotlin", color: "purple", prefix: "kt-", lessons: 5, description: "Modern Android development" },
    { id: "dart", name: "Dart", color: "blue", prefix: "dart-", lessons: 5, description: "Client-optimized for fast apps" },
    { id: "csharp", name: "C#", color: "purple", prefix: "cs-", lessons: 5, description: "Versatile .NET language" },
    { id: "go", name: "Go", color: "cyan", prefix: "go-", lessons: 5, description: "Simple, reliable, efficient" },
    { id: "rust", name: "Rust", color: "orange", prefix: "rs-", lessons: 5, description: "Performance and safety" },
    { id: "r", name: "R", color: "blue", prefix: "r-", lessons: 5, description: "Statistical computing" },
    { id: "julia", name: "Julia", color: "purple", prefix: "jl-", lessons: 5, description: "High-performance numerical analysis" },
    { id: "scala", name: "Scala", color: "red", prefix: "scala-", lessons: 5, description: "Scalable language" }
];

// --- 3. Seeding Logic (FIXED MAPPING) ---

async function seedLanguages() {
    console.log("Seeding Languages...");
    const { error } = await supabase.from('languages').upsert(
        LANGUAGES.map(l => ({
            id: l.id,
            name: l.name,
            color: l.color,
            description: l.description,
            lessons_count: l.lessons,
            prefix: l.prefix
        }))
    );
    if (error) console.error("Error seeding languages:", error);
    else console.log("Languages seeded.");
}

async function seedLessons() {
    console.log("Seeding Lessons...");
    try {
        const lessonsPath = path.resolve(process.cwd(), 'data/lessons-seed.json');
        const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));

        const formattedLessons = lessonsData.map((l: any) => ({
            id: l.id,
            language: l.language,      // REQUIRED: 'language' column
            language_id: l.language,   // RELATION: 'language_id' column
            title: l.title,
            content: l.content,
            code_example: l.codeExample,
            try_starter: l.tryStarter || "",
            "order": parseInt(l.id.split('-').pop() || "0")
        }));

        const { error } = await supabase.from('lessons').upsert(formattedLessons);
        if (error) console.error("Error seeding lessons:", error);
        else console.log(`Seeded ${formattedLessons.length} lessons.`);

    } catch (e) {
        console.error("Error with lessons:", e);
    }
}

async function seedProblems() {
    console.log("Seeding Practice Problems...");
    try {
        const challengesPath = path.resolve(process.cwd(), 'lib/challenges.ts');
        const importUrl = pathToFileURL(challengesPath).href;

        const { DEMO_PROBLEMS } = await import(importUrl) as any;

        const formattedProblems = DEMO_PROBLEMS.map((p: any) => ({
            id: p.id,
            language: p.language,    // REQUIRED
            language_id: p.language, // RELATION
            title: p.title,
            difficulty: p.difficulty,
            description: p.description,
            examples: p.examples || "",
            solution: p.solution || "",
            hints: p.hints || ""
        }));

        const { error } = await supabase.from('practice_problems').upsert(formattedProblems);
        if (error) console.error("Error seeding practice_problems:", error);
        else console.log(`Seeded ${formattedProblems.length} problems.`);

    } catch (e) {
        console.error("Error with problems:", e);
    }
}

async function seedProjects() {
    console.log("Seeding Projects...");
    try {
        const projectsPath = path.resolve(process.cwd(), 'data/projects.ts');
        const importUrl = pathToFileURL(projectsPath).href;
        const { PROJECT_DATA } = await import(importUrl) as any;

        const projectsArray = Object.values(PROJECT_DATA).map((p: any) => ({
            id: p.id,
            language: p.language,    // REQUIRED
            language_id: p.language, // RELATION
            title: p.title,
            difficulty: p.difficulty,
            duration: p.duration,
            description: p.description,
            overview: p.overview,
            concepts: p.concepts,
            steps: p.steps,
            starter_code: p.starterCode,
            solution_code: p.solution
        }));

        const { error } = await supabase.from('projects').upsert(projectsArray);
        if (error) console.error("Error seeding projects:", error);
        else console.log(`Seeded ${projectsArray.length} projects.`);

    } catch (e) {
        console.error("Error with projects:", e);
    }
}

async function main() {
    await seedLanguages();
    await seedLessons();
    await seedProblems();
    await seedProjects();
}

main().catch(console.error);
