import { getPracticeData } from './lib/practiceData';
try {
  const data = getPracticeData('Web dev');
  console.log('Levels length:', data.length);
  for (const level of data) {
    console.log(`Level ${level.level}: ${level.title}, Modules: ${level.modules?.length}`);
    for (const mod of level.modules || []) {
      console.log(`  Module ${mod.moduleId}: ${mod.title}, Lessons: ${mod.lessons?.length}`);
      for (const lesson of mod.lessons || []) {
        if (!lesson.lessonId || !lesson.title) {
          console.log(`    WARNING: Invalid lesson structure`, Object.keys(lesson));
        }
      }
    }
  }
} catch (e) {
  console.error(e);
}
