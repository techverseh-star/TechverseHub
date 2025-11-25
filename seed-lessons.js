// Example: Insert lessons
import { supabase } from './lib/supabase';
import lessonsData from './data/lessons-seed.json';

async function seedLessons() {
  const { error } = await supabase.from('lessons').insert(lessonsData);
  if (error) console.error('Error seeding lessons:', error);
  else console.log('Lessons seeded successfully!');
}

seedLessons();

