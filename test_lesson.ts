import { getPracticeLesson, getPracticeData } from './lib/practiceData';
try {
  console.log("Web dev data:", getPracticeData('Web dev')[0].title);
  console.log("Dsa data:", getPracticeData('Dsa')[0].title);
  console.log("Lesson:", getPracticeLesson(1, 'module-1', '1', 'Web dev')?.title);
} catch (e) {
  console.error(e);
}
