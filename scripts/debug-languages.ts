import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

async function checkLanguages() {
    console.log("Checking distinct language values in practice_problems...");

    const { data, error } = await supabase
        .from('practice_problems')
        .select('language');

    if (error) {
        console.error("Error:", error);
        return;
    }

    const counts: Record<string, number> = {};
    data.forEach((row: any) => {
        const lang = row.language || 'NULL';
        counts[lang] = (counts[lang] || 0) + 1;
    });

    console.log("Language distribution:");
    console.table(counts);
}

checkLanguages();
