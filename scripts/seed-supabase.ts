import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import crypto from 'crypto';

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

// LANGUAGES
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

// --- 3. Seeding Logic ---

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
        if (fs.existsSync(lessonsPath)) {
            const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));

            const formattedLessons = lessonsData.map((l: any) => ({
                id: l.id,
                language: l.language,
                language_id: l.language,
                title: l.title,
                content: l.content,
                code_example: l.codeExample || l.codeexample,
                try_starter: l.tryStarter || l.trystarter || "",
                "order": parseInt(l.id.split('-').pop() || "0")
            }));

            const { error } = await supabase.from('lessons').upsert(formattedLessons);
            if (error) console.error("Error seeding lessons:", error);
            else console.log(`Seeded ${formattedLessons.length} lessons.`);
        } else {
            console.log("No lessons-seed.json found, skipping.");
        }
    } catch (e) {
        console.error("Error with lessons:", e);
    }
}

async function seedProblems() {
    console.log("Seeding Practice Problems from JSONs...");
    try {
        const dataDir = path.resolve(process.cwd(), 'data');
        const problems: any[] = [];

        if (fs.existsSync(dataDir)) {
            const entries = fs.readdirSync(dataDir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const langDir = path.join(dataDir, entry.name);
                    const files = fs.readdirSync(langDir);

                    for (const file of files) {
                        if (file.startsWith('practice_problems_') && file.endsWith('.json')) {
                            const filePath = path.join(langDir, file);
                            console.log(`Processing file: ${entry.name}/${file}`);
                            try {
                                const content = fs.readFileSync(filePath, 'utf8');
                                const jsonProblems = JSON.parse(content);
                                if (Array.isArray(jsonProblems)) {
                                    console.log(`  - Found ${jsonProblems.length} problems`);
                                    problems.push(...jsonProblems);
                                } else {
                                    console.warn(`  - Warning: Content is not an array in ${file}`);
                                }
                            } catch (parseError) {
                                console.error(`  - Error parsing ${file}:`, parseError);
                            }
                        }
                    }
                }
            }
        }

        if (problems.length > 0) {
            // Validate required fields
            const validProblems = problems.filter(p => {
                if (!p.id || !p.title || !p.difficulty || !p.description) {
                    console.warn(`Skipping invalid problem (missing fields): ${JSON.stringify(p).substring(0, 100)}...`);
                    return false;
                }
                return true;
            });

            const formattedProblems = validProblems.map((p: any) => {
                let lang = p.language.toLowerCase();
                if (lang === 'c#') lang = 'csharp';
                if (lang === 'c++') lang = 'cpp';

                return {
                    id: p.id,
                    language: lang,
                    language_id: lang,
                    title: p.title,
                    difficulty: p.difficulty,
                    description: p.description,
                    examples: p.examples ? (typeof p.examples === 'string' ? p.examples : JSON.stringify(p.examples)) : "",
                    solution: p.solution || "",
                    hints: p.hints || ""
                };
            });

            console.log(`Total valid problems: ${formattedProblems.length}. Inserting in batches...`);

            const batchSize = 50;
            for (let i = 0; i < formattedProblems.length; i += batchSize) {
                const batch = formattedProblems.slice(i, i + batchSize);
                const { error } = await supabase.from('practice_problems').upsert(batch);
                if (error) {
                    console.error(`Error seeding problems batch ${i}:`, error);
                } else {
                    console.log(`Seeded problems batch ${i} - ${Math.min(i + batchSize, formattedProblems.length)} of ${formattedProblems.length}`);
                }
            }
        } else {
            console.log("No practice problems found in JSONs.");
        }

    } catch (e) {
        console.error("Error with problems:", e);
    }
}

async function seedTestCases() {
    console.log("Seeding Test Cases from JSONs...");
    try {
        const dataDir = path.resolve(process.cwd(), 'data');
        const testCases: any[] = [];

        if (fs.existsSync(dataDir)) {
            const entries = fs.readdirSync(dataDir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const langDir = path.join(dataDir, entry.name);
                    const files = fs.readdirSync(langDir);

                    for (const file of files) {
                        // Prioritize testcases_*.json, ignore testcases_seed_*.json
                        if (file.startsWith('testcases_') && !file.startsWith('testcases_seed_') && file.endsWith('.json')) {
                            const filePath = path.join(langDir, file);
                            try {
                                const content = fs.readFileSync(filePath, 'utf8');
                                const jsonTestCases = JSON.parse(content);
                                if (Array.isArray(jsonTestCases)) {
                                    testCases.push(...jsonTestCases);
                                }
                            } catch (parseError) {
                                console.error(`  - Error parsing ${file}:`, parseError);
                            }
                        }
                    }
                }
            }
        }

        if (testCases.length > 0) {
            // Fetch existing problem IDs to ensure referential integrity
            const { data: existingProblems, error: fetchError } = await supabase
                .from('practice_problems')
                .select('id');

            if (fetchError) {
                console.error("Error fetching problem IDs for validation:", fetchError);
                return;
            }

            const validProblemIds = new Set(existingProblems?.map(p => p.id));
            console.log(`Found ${validProblemIds.size} existing problems in DB.`);

            // Validate required fields AND foreign key
            const validTestCases = testCases.filter(tc => {
                const hasInput = tc.input !== undefined && tc.input !== null;
                const hasOutput = tc.output !== undefined && tc.output !== null;
                const isValidFK = validProblemIds.has(tc.problem_id);

                if (!hasInput || !hasOutput) return false;
                if (!isValidFK) {
                    // console.warn(`Skipping testcase for non-existent problem: ${tc.problem_id}`);
                    return false;
                }
                return true;
            });

            const formattedTestCases = validTestCases.map((tc: any) => ({
                id: crypto.randomUUID(), // GEN UUID
                problem_id: tc.problem_id,
                input: typeof tc.input === 'object' ? JSON.stringify(tc.input) : String(tc.input),
                output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
                hidden: !!tc.hidden
            }));

            console.log(`Total testcases found: ${testCases.length}. Valid: ${formattedTestCases.length}. Inserting in batches...`);

            const batchSize = 1000;
            for (let i = 0; i < formattedTestCases.length; i += batchSize) {
                const batch = formattedTestCases.slice(i, i + batchSize);
                const { error } = await supabase.from('testcases').upsert(batch);
                if (error) {
                    console.error(`Error seeding testcases batch ${i}:`, error);
                } else {
                    console.log(`Seeded testcases batch ${i} - ${Math.min(i + batchSize, formattedTestCases.length)} of ${formattedTestCases.length}`);
                }
            }
        } else {
            console.log("No test cases found in JSONs.");
        }

    } catch (e) {
        console.error("Error with testcases:", e);
    }
}

async function seedProjects() {
    console.log("Seeding Projects...");
    try {
        const projectsPath = path.resolve(process.cwd(), 'data/projects.ts');
        if (fs.existsSync(projectsPath)) {
            const importUrl = pathToFileURL(projectsPath).href;
            const { PROJECT_DATA } = await import(importUrl) as any;

            const projectsArray = Object.values(PROJECT_DATA).map((p: any) => ({
                id: p.id,
                language: p.language,
                language_id: p.language,
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
        } else {
            console.log("projects.ts not found, skipping.");
        }

    } catch (e) {
        console.error("Error with projects:", e);
    }
}

async function main() {
    await seedLanguages();
    await seedLessons();
    await seedProblems();
    await seedTestCases();
    await seedProjects();
}

main().catch(console.error);
