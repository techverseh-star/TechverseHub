import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load Env
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
        }
    } catch (e) {
        console.error("Error loading .env.local", e);
    }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verify() {
    console.log("Verifying Database Content...");

    const { count: problemCount, error: problemError } = await supabase
        .from('practice_problems')
        .select('*', { count: 'exact', head: true });

    if (problemError) console.error("Error fetching problems:", problemError);
    else console.log(`Total Practice Problems: ${problemCount}`);

    const { count: testCaseCount, error: testCaseError } = await supabase
        .from('testcases')
        .select('*', { count: 'exact', head: true });

    if (testCaseError) console.error("Error fetching test cases:", testCaseError);
    else console.log(`Total Test Cases: ${testCaseCount}`);

    // Check specific language counts
    const languages = ['php', 'ruby', 'sql', 'swift', 'kotlin', 'dart', 'csharp', 'go', 'r'];
    for (const lang of languages) {
        const { count, error } = await supabase
            .from('practice_problems')
            .select('*', { count: 'exact', head: true })
            .eq('language', lang);

        if (!error) console.log(`- ${lang}: ${count} problems`);
    }
}

verify();
