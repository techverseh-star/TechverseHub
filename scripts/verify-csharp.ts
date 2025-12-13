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

async function verify() {
    const targetId = 'cs-e-1';
    const targetTitle = 'Print Hello World';

    console.log(`Verifying problem ID: ${targetId}, Title: ${targetTitle}...`);

    const { data, error } = await supabase
        .from('practice_problems')
        .select('*')
        .eq('id', targetId)
        .single();

    if (error) {
        console.error("Error fetching problem:", error);
    } else {
        console.log("Problem found in DB:");
        console.log(`- ID: ${data.id}`);
        console.log(`- Title: ${data.title}`);
        console.log(`- Language: ${data.language}`);

        if (data.title === targetTitle) {
            console.log("SUCCESS: Database content matches JSON file.");
        } else {
            console.error("FAILURE: Title mismatch.");
        }
    }
}
verify();
