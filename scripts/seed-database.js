const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedLessons() {
  console.log('Seeding lessons...');
  
  const lessonsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/lessons-seed.json'), 'utf8')
  );

  const lessons = lessonsData.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    language: lesson.language,
    content: lesson.content,
    code_example: lesson.codeExample,
    try_it_starter: lesson.tryStarter,
    order_index: index + 1,
    difficulty: getDifficulty(lesson.id),
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('lessons')
    .upsert(lessons, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding lessons:', error);
  } else {
    console.log(`Successfully seeded ${lessons.length} lessons`);
  }
}

async function seedProblems() {
  console.log('Seeding practice problems...');
  
  const problemsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/practice-problems.json'), 'utf8')
  );

  const problems = problemsData.map((problem, index) => ({
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    language: problem.language,
    description: problem.description,
    examples: problem.examples,
    solution: problem.solution,
    hints: problem.hints,
    order_index: index + 1,
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('problems')
    .upsert(problems, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding problems:', error);
  } else {
    console.log(`Successfully seeded ${problems.length} problems`);
  }
}

async function seedTestcases() {
  console.log('Seeding test cases...');
  
  const testcasesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/testcases.json'), 'utf8')
  );

  const testcases = [];
  let id = 1;

  for (const [problemId, cases] of Object.entries(testcasesData)) {
    for (const testcase of cases) {
      testcases.push({
        id: `tc-${id++}`,
        problem_id: problemId,
        input: JSON.stringify(testcase.input),
        expected_output: JSON.stringify(testcase.expected),
        is_sample: true,
        created_at: new Date().toISOString()
      });
    }
  }

  const { error } = await supabase
    .from('testcases')
    .upsert(testcases, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding testcases:', error);
  } else {
    console.log(`Successfully seeded ${testcases.length} test cases`);
  }
}

function getDifficulty(lessonId) {
  const num = parseInt(lessonId.split('-')[1]);
  if (num <= 5) return 'beginner';
  if (num <= 10) return 'intermediate';
  return 'advanced';
}

async function main() {
  console.log('Starting database seeding...');
  console.log('Using Supabase URL:', supabaseUrl);
  
  try {
    await seedLessons();
    await seedProblems();
    await seedTestcases();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
