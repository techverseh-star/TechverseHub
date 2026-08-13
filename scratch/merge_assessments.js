const fs = require('fs');
const path = require('path');

const dsaPath = path.join(process.cwd(), 'Json Files', 'Dsa');

for (let level = 1; level <= 3; level++) {
  const levelPath = path.join(dsaPath, `level ${level}`);
  if (!fs.existsSync(levelPath)) continue;
  const files = fs.readdirSync(levelPath);

  for (const file of files) {
    if (file.endsWith('_enriched.json')) {
      const match = file.match(/dsa_(L\d_M\d+)_enriched\.json/);
      if (match) {
        const modId = match[1];
        const assessmentFile = path.join(dsaPath, `${modId}_assessment.json`);
        
        if (fs.existsSync(assessmentFile)) {
          const modData = JSON.parse(fs.readFileSync(path.join(levelPath, file), 'utf8'));
          const assessmentData = JSON.parse(fs.readFileSync(assessmentFile, 'utf8'));
          
          if (modData.lessons && assessmentData.lessons) {
            for (const modLesson of modData.lessons) {
              const asmtLesson = assessmentData.lessons.find(l => l.lesson_number === modLesson.lesson_number);
              if (asmtLesson) {
                modLesson.practice_assessment = {
                  theory_mcq: asmtLesson.theory_mcq || [],
                  logic_mcq: asmtLesson.logic_mcq || [],
                  syntax_mcq: asmtLesson.syntax_mcq || [],
                  coding_challenges: asmtLesson.coding_challenges || []
                };
              }
            }
          }
          
          if (assessmentData.assessment_type) modData.assessment_type = assessmentData.assessment_type;
          if (assessmentData.assessment_style) modData.assessment_style = assessmentData.assessment_style;
          if (assessmentData.assessment_summary) modData.assessment_summary = assessmentData.assessment_summary;
          
          fs.writeFileSync(path.join(levelPath, file), JSON.stringify(modData, null, 2));
          console.log(`Merged ${modId} assessment into enriched module`);
          
          // Optionally, move the assessment file to a backup directory or inside the level directory
          const backupDir = path.join(dsaPath, 'backup');
          if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
          fs.renameSync(assessmentFile, path.join(backupDir, `${modId}_assessment.json`));
        }
      }
    }
  }
}
console.log('Done merging assessments.');
