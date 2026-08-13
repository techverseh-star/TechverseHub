import fs from 'fs';
import path from 'path';

export interface PracticeLesson {
  lessonId: string;
  title: string;
  definition?: { title: string; content: string };
  theory?: { title: string; sections: { heading: string; content: string }[] };
  easyExample?: { title: string; content: string };
  terms?: { term: string; meaning: string }[];
  basicCode?: { title: string; code: string; explanation: string[] };
  summary?: string[];

  // New fields added by user
  whyThisExists?: { problem: string; solution: string };
  mentalModel?: { title: string; explanation: string[] };
  realWorldAnalogy?: { title: string; content: string };
  internalWorking?: { title: string; steps: string[] };
  executionFlow?: { title: string; flow: string[] };
  browserBehavior?: { title: string; points: string[] };
  visualArchitecture?: { title: string; diagram: string[] };
  fileConnections?: { title: string; structure: Record<string, string>; connectionFlow: string[] };
  stepByStepBreakdown?: { title: string; steps: { step: number; action: string }[] };
  codeDeepExplanation?: { title: string; code: string; lineByLine: { line: string; meaning: string }[] };
  practiceSystem?: {
    conceptGoal?: string;
    realWorldPurpose?: string;
    theoryUsed?: string[];
    learningFlow?: Record<string, any>; // Complex nested object
  };
  failureScenarios?: { title: string; cases: { issue: string; result: string }[] };
  debugThinking?: { title: string; questions: string[] };
  engineeringThinking?: { title: string; points: string[] };
  productionReality?: { title: string; examples: string[] };
  tagCategories?: { title: string; categories: { category: string; purpose: string; tags: string[] }[] };
  syntaxExamples?: { title: string; examples: { tag: string; code: string; purpose: string }[] };

  // DSA v2.1 fields
  visual_explanation?: { type: string; description: string };
  interview_war_story?: { context: string; story: string; lesson: string };
  quiz?: { passing_score_percent: number; questions: any[] };
  coding_quest?: { id: string; title: string; difficulty: string; xp_reward: number; pattern: string; problem_statement: string; starter_code: any; wrong_approach_shown_first: any; optimal_solution: any; test_cases: any[]; hints: any[] };
  codingChallenge?: any;
  practice_assessment?: {
    theory_mcq: any[];
    logic_mcq: any[];
    syntax_mcq: any[];
    coding_challenges: any[];
  };
}

export interface PracticeModule {
  moduleId: string;
  title: string;
  description: string;
  difficulty: string;
  learningObjectives: string[];
  lessons: PracticeLesson[];
  level: number;
  finalModuleProject?: any;
  
  // DSA v2.1 fields
  pattern_index?: any;
  complexity_cheat_sheet?: any;
  why_companies_ask_this?: any;
  spaced_review?: any;
  assessment_type?: string;
  assessment_style?: string;
  assessment_summary?: any;
}

export interface PracticeLevel {
  level: number;
  title: string;
  modules: PracticeModule[];
}

const DATA_DIR_WEB = path.join(process.cwd(), 'Json Files', 'Web dev');
const DATA_DIR_DSA = path.join(process.cwd(), 'Json Files', 'Dsa');

// Helper to read JSON file safely
function readJsonFile(filePath: string): any {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    const txtPath = filePath.replace('.json', '.txt');
    if (fs.existsSync(txtPath)) {
      const content = fs.readFileSync(txtPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}:`, error);
  }
  return null;
}

// In-memory cache so repeated requests don't re-read and re-parse ~14MB of
// curriculum JSON from disk on every call within the same server process.
const practiceDataCache = new Map<string, PracticeLevel[]>();

export function getPracticeData(category: string = 'Web dev'): PracticeLevel[] {
  const cached = practiceDataCache.get(category);
  if (cached) return cached;

  const levels: PracticeLevel[] = [];
  const baseDir = category === 'Dsa' ? DATA_DIR_DSA : DATA_DIR_WEB;

  for (let i = 1; i <= 3; i++) {
    let levelDir = path.join(baseDir, `level ${i}`);
    if (!fs.existsSync(levelDir)) {
      levelDir = path.join(baseDir, `Level ${i}`);
      if (!fs.existsSync(levelDir)) continue;
    }

    const modules: PracticeModule[] = [];
    const files = fs.readdirSync(levelDir).filter(file => file.endsWith('.json') || file.endsWith('.txt'));

    for (const file of files) {
      const filePath = path.join(levelDir, file);
      const data = readJsonFile(filePath);

      let rawModules: any[] = [];

      if (data && typeof data.module === 'object' && !Array.isArray(data.module) && data.module !== null) {
        rawModules.push(data.module);
      } else if (data && data.level && typeof data.level.module === 'object' && !Array.isArray(data.level.module) && data.level.module !== null) {
        rawModules.push(data.level.module);
      } else if (data && (data.module_id || data.moduleId || typeof data.module === 'number' || typeof data.module === 'string') && Array.isArray(data.lessons)) {
        rawModules.push(data);
      } else if (data && Array.isArray(data.levels)) {
        for (const levelObj of data.levels) {
          if (Array.isArray(levelObj.modules)) {
            for (const mod of levelObj.modules) {
              rawModules.push(mod);
            }
          }
        }
      }

      if (rawModules.length === 0 && data && data.lessonId) {
        // Handle cases where the file is a single lesson directly (no module wrapper)
        modules.push({
          moduleId: file.replace('.json', '').replace('.txt', ''),
          title: data.title || "Module " + file,
          description: data.definition?.content || "Detailed module.",
          difficulty: "Beginner",
          learningObjectives: [],
          lessons: [data],
          level: i,
        });
      }

      for (const rawMod of rawModules) {
        const modObject = {
          moduleId: rawMod.module_id || rawMod.moduleId || `module-${rawMod.module}`,
          title: typeof rawMod.module === 'string' ? rawMod.module : (rawMod.module_title || rawMod.title || "Unknown Module"),
          description: rawMod.module_definition || rawMod.description || "",
          difficulty: rawMod.difficulty || "Beginner",
          learningObjectives: rawMod.learning_outcomes || rawMod.learningObjectives || (rawMod.module_goal ? [rawMod.module_goal] : []),
          
          // DSA v2.1 Fields
          pattern_index: rawMod.pattern_index,
          complexity_cheat_sheet: rawMod.complexity_cheat_sheet,
          why_companies_ask_this: rawMod.why_companies_ask_this,
          spaced_review: rawMod.spaced_review,
          finalModuleProject: rawMod.finalModuleProject || rawMod.final_module_project,
          assessment_type: rawMod.assessment_type,
          assessment_style: rawMod.assessment_style,
          assessment_summary: rawMod.assessment_summary,
          
          lessons: (rawMod.lessons || []).map((l: any) => {
            const mappedLesson: any = {
              lessonId: l.lesson_id || l.lessonId || (l.lesson_number ? l.lesson_number.toString() : Math.random().toString(36).substr(2, 9)),
              title: l.title || "Untitled Lesson",
            };

            // Map theory format to UI format
            if (l.theory) {
              if (typeof l.theory.definition === 'string') {
                mappedLesson.definition = {
                  title: "Definition",
                  content: l.theory.definition
                };
              }

              mappedLesson.theory = {
                title: "Theory & Concepts",
                sections: []
              };

              if (l.theory.explanation) {
                mappedLesson.theory.sections.push({ heading: "Explanation", content: l.theory.explanation });
              }
              if (l.theory.how_it_works) {
                mappedLesson.theory.sections.push({ heading: "How It Works", content: l.theory.how_it_works });
              }
              if (l.theory.real_world_example) {
                mappedLesson.theory.sections.push({ heading: "Real World Example", content: l.theory.real_world_example });
              }
              if (l.theory.design_theory) {
                mappedLesson.theory.sections.push({ heading: "Design Theory", content: l.theory.design_theory });
              }
            }

            // Map newest flat format
            if (l.definition && Array.isArray(l.definition.content)) {
              mappedLesson.definition = {
                title: l.definition.title || "Definition",
                content: l.definition.content.join("\n")
              };
            }
            if (l.mentalModel && Array.isArray(l.mentalModel.content)) {
              mappedLesson.mentalModel = {
                title: l.mentalModel.title || "Mental Model",
                explanation: l.mentalModel.content
              };
            }
            if (l.structure) {
              if (Array.isArray(l.structure.content)) {
                if (!mappedLesson.theory) mappedLesson.theory = { title: "Theory & Concepts", sections: [] };
                mappedLesson.theory.sections.push({
                  heading: l.structure.title || "Structure",
                  content: l.structure.content.join("\n")
                });
              } else if (Array.isArray(l.structure.categories)) {
                mappedLesson.tagCategories = {
                  title: l.structure.title || "Categories",
                  categories: l.structure.categories
                };
              }
            }
            if (l.example && Array.isArray(l.example.content)) {
              mappedLesson.easyExample = {
                title: l.example.title || "Example",
                content: l.example.content.join("\n")
              };
            }
            if (l.realUsage && Array.isArray(l.realUsage.content)) {
              if (!mappedLesson.theory) mappedLesson.theory = { title: "Theory & Concepts", sections: [] };
              mappedLesson.theory.sections.push({
                heading: l.realUsage.title || "Real World Usage",
                content: l.realUsage.content.join("\n")
              });
            }
            if (l.internalWorking && Array.isArray(l.internalWorking.content)) {
              mappedLesson.internalWorking = {
                title: l.internalWorking.title || "Internal Working",
                steps: l.internalWorking.content
              };
            }
            if (l.failureCases && Array.isArray(l.failureCases.cases)) {
              mappedLesson.failureScenarios = {
                title: l.failureCases.title || "Failure Cases",
                cases: l.failureCases.cases.map((c: any) => ({
                  issue: c.issue,
                  result: c.explanation || c.result
                }))
              };
            }
            if (l.debugging && Array.isArray(l.debugging.content)) {
              mappedLesson.debugThinking = {
                title: l.debugging.title || "Debugging",
                questions: l.debugging.content
              };
            }
            if (l.engineeringThinking && Array.isArray(l.engineeringThinking.content)) {
              mappedLesson.engineeringThinking = {
                title: l.engineeringThinking.title || "Engineering Thinking",
                points: l.engineeringThinking.content
              };
            }
            if (l.syntax) {
              if (Array.isArray(l.syntax.examples)) {
                mappedLesson.syntaxExamples = {
                  title: l.syntax.title || "Syntax Examples",
                  examples: l.syntax.examples
                };
              } else {
                mappedLesson.basicCode = {
                  title: l.syntax.title || "Example Code",
                  code: l.syntax.code || "",
                  explanation: l.syntax.explanation || []
                };
              }
            }

            // Map practice format to basicCode format if syntax is not provided
            if (l.practice && !l.syntax && l.practice.starter_code) {
              mappedLesson.basicCode = {
                title: l.practice.title || "Practice",
                code: l.practice.starter_code || "// Write your code here",
                explanation: Array.isArray(l.practice.hints) ? l.practice.hints : []
              };
            }

            // Copy over top-level sections if they exist in the new format
            if (l.sections && Array.isArray(l.sections)) {
              mappedLesson.sections = l.sections;
            }

            // Map NEW DSA format (v2.1)
            const formatProse = (text: string) => {
              if (!text) return "";
              // 1. Insert double newline after a period followed by a space and uppercase letter
              let formatted = text.replace(/\. ([A-Z])/g, '.\n\n$1');
              // 2. Bold inline Big O notations
              formatted = formatted.replace(/ (O\([a-zA-Z0-9\s^!²ⁿ]+\))/g, ' **$1**');
              // 3. Convert paragraphs starting with O( into bullet points
              formatted = formatted.replace(/\n\n(O\([a-zA-Z0-9\s^!²ⁿ]+\))/g, '\n\n- **$1**');
              return formatted;
            };

            if (!mappedLesson.sections && (l.objective || l.explanation || l.analogy || l.code_example)) {
              mappedLesson.sections = [];
              if (l.objective) {
                mappedLesson.lessonGoal = l.objective;
              }
              
              if (l.explanation) {
                mappedLesson.sections.push({
                  title: "Explanation",
                  type: "definition",
                  content: formatProse(l.explanation) + (l.concepts ? "\n\n**Core Concepts:**\n\n- " + l.concepts.join("\n- ") : "")
                });
              }
              
              if (l.analogy) {
                mappedLesson.sections.push({
                  title: "Mental Model",
                  type: "mentalModel",
                  analogy: formatProse(l.analogy)
                });
              }
              
              if (l.code_example) {
                mappedLesson.sections.push({
                  title: "Code Example",
                  type: "codeLesson",
                  starterCode: l.code_example.code,
                  intro: l.code_example.explanation
                });
              }
              
              if (l.common_mistakes && Array.isArray(l.common_mistakes)) {
                mappedLesson.sections.push({
                  title: "Common Mistakes",
                  type: "failureCases",
                  cases: l.common_mistakes.map((err: string) => ({
                    issue: err,
                    whatHappens: "Common interview pitfall",
                    userFix: "Review and avoid this mistake"
                  }))
                });
              }
              
              if (l.interview_relevance) {
                mappedLesson.sections.push({
                  title: "Interview Relevance",
                  type: "engineeringThinking",
                  content: l.interview_relevance
                });
              }
              
              if (l.mini_challenge) {
                mappedLesson.codingChallenge = {
                  title: "Mini Challenge",
                  description: l.mini_challenge,
                  estimatedTime: "5 mins",
                  xpReward: 10,
                  instructions: [l.mini_challenge],
                  validationRules: [],
                  hints: []
                };
              }
            } else if (!mappedLesson.sections && l.subtopics && Array.isArray(l.subtopics)) {
              mappedLesson.sections = [];
              
              if (typeof l.definition === 'string') {
                mappedLesson.sections.push({
                  title: "Definition",
                  type: "definition",
                  content: formatProse(l.definition)
                });
              }

              l.subtopics.forEach((st: any) => {
                let contentStr = "";
                if (st.explanation) contentStr += formatProse(st.explanation) + "\n\n";
                if (st.definition) contentStr += formatProse(st.definition) + "\n\n";
                if (st.examples && Array.isArray(st.examples)) {
                  contentStr += "**Examples:**\n- " + st.examples.join("\n- ") + "\n\n";
                }
                if (st.steps && Array.isArray(st.steps)) {
                  contentStr += st.steps.map((s: any) => `**Step ${s.step}: ${s.action || s.name}**\n${s.detail || s.output || ''}`).join("\n\n") + "\n\n";
                }
                if (st.types && Array.isArray(st.types)) {
                  contentStr += st.types.map((t: any) => `**${t.role || t.type}**\n${t.focus || t.role || ''}\n${t.tools ? "Tools: " + (Array.isArray(t.tools) ? t.tools.join(", ") : t.tools) : ""}`).join("\n\n") + "\n\n";
                }
                
                if (contentStr.trim()) {
                  mappedLesson.sections.push({
                    title: st.name || "Explanation",
                    type: "definition",
                    content: contentStr.trim()
                  });
                }
                
                if (st.analogy) {
                  mappedLesson.sections.push({
                    title: "Mental Model",
                    type: "mentalModel",
                    analogy: formatProse(st.analogy)
                  });
                }
              });

              if (l.use_cases && Array.isArray(l.use_cases)) {
                mappedLesson.sections.push({
                  title: "Use Cases",
                  type: "engineeringThinking",
                  content: "- " + l.use_cases.join("\n- ")
                });
              }

              if (l.common_misconceptions && Array.isArray(l.common_misconceptions)) {
                mappedLesson.sections.push({
                  title: "Common Misconceptions",
                  type: "failureCases",
                  cases: l.common_misconceptions.map((m: any) => ({
                    issue: m.misconception,
                    whatHappens: "Misconception",
                    userFix: m.reality
                  }))
                });
              }

              if (l.common_failures && Array.isArray(l.common_failures)) {
                mappedLesson.sections.push({
                  title: "Common Failures",
                  type: "failureCases",
                  cases: l.common_failures.map((f: any) => ({
                    issue: f.failure,
                    whatHappens: f.cause || f.consequence || f.example || "Failure",
                    userFix: f.fix || f.clarification || "Review and avoid"
                  }))
                });
              }

              if (l.key_terms && Array.isArray(l.key_terms)) {
                mappedLesson.sections.push({
                  title: "Key Terms",
                  type: "definition",
                  content: l.key_terms.map((t: any) => `**${t.term}**: ${t.definition}`).join("\n\n")
                });
              }
            } else {
              if (l.lessonGoal) {
                mappedLesson.lessonGoal = l.lessonGoal;
              }
              if (l.codingChallenge) {
                mappedLesson.codingChallenge = l.codingChallenge;
              }
            }

            if (l.practice_assessment) {
              mappedLesson.practice_assessment = l.practice_assessment;
            }

            return { ...l, ...mappedLesson };
          })
        };

        modules.push({
          ...modObject,
          level: i,
        });
      }
    }

    // Sort modules by module number if they follow "module-X" or "level-X-module-Y" format
    modules.sort((a, b) => {
      // Extract numbers safely
      const aId = String(a.moduleId || '');
      const bId = String(b.moduleId || '');
      const numAMatch = aId.match(/\d+/g);
      const numBMatch = bId.match(/\d+/g);
      const numA = numAMatch ? parseInt(numAMatch[numAMatch.length - 1]) : 0;
      const numB = numBMatch ? parseInt(numBMatch[numBMatch.length - 1]) : 0;
      return numA - numB;
    });

    let title = `Level ${i}`;
    if (category === 'Web dev') {
      if (i === 1) title = "Foundations of Software Development";
      if (i === 2) title = "Intermediate Software Engineering";
      if (i === 3) title = "Production Engineering and System Design";
    } else if (category === 'Dsa') {
      if (i === 1) title = "Foundations Of DSA";
      if (i === 2) title = "Intermediate DSA";
      if (i === 3) title = "Advanced DSA";
    }

    levels.push({
      level: i,
      title,
      modules
    });
  }

  practiceDataCache.set(category, levels);
  return levels;
}

export interface PracticeSummaryLesson {
  lessonId: string;
  title: string;
}

export interface PracticeSummaryModule {
  moduleId: string;
  title: string;
  description: string;
  difficulty: string;
  lessons: PracticeSummaryLesson[];
}

export interface PracticeSummaryLevel {
  level: number;
  title: string;
  modules: PracticeSummaryModule[];
}

// List/sidebar views only ever render {title, description, difficulty} per
// module and {lessonId, title} per lesson - not the theory/code/quiz content
// that makes up the bulk of each lesson (multiple MB for the DSA category).
// This projects the already-cached full tree down to just those fields so
// list pages don't have to download and discard the heavy content.
const practiceSummaryCache = new Map<string, PracticeSummaryLevel[]>();

export function getPracticeSummary(category: string = 'Web dev'): PracticeSummaryLevel[] {
  const cached = practiceSummaryCache.get(category);
  if (cached) return cached;

  const levels = getPracticeData(category);
  const summary = levels.map((level) => ({
    level: level.level,
    title: level.title,
    modules: level.modules.map((module) => ({
      moduleId: module.moduleId,
      title: module.title,
      description: module.description,
      difficulty: module.difficulty,
      lessons: module.lessons.map((lesson) => ({
        lessonId: lesson.lessonId,
        title: lesson.title,
      })),
    })),
  }));

  practiceSummaryCache.set(category, summary);
  return summary;
}

// The single-lesson page only ever reads {moduleId, title, finalModuleProject}
// off the returned `module` (confirmed: no other field is consumed) - never
// the sibling lessons' full theory/code/quiz content, which is what made the
// old full-module response multiple hundred KB per lesson view.
export interface PracticeLessonModule {
  moduleId: string;
  title: string;
  finalModuleProject?: any;
}

export function getPracticeLesson(level: number, moduleId: string, lessonId: string, category?: string): { module: PracticeLessonModule, lesson: PracticeLesson, category: string, prev?: { level: number, moduleId: string, lessonId: string, title: string } | null, next?: { level: number, moduleId: string, lessonId: string, title: string } | null } | null {
  const categories = category ? [category] : ['Web dev', 'Dsa'];
  
  for (const cat of categories) {
    const levels = getPracticeData(cat);
    const levelData = levels.find(l => l.level === level);
    if (!levelData) continue;
  
    const moduleData = levelData.modules.find(m => m.moduleId === moduleId);
    if (!moduleData) continue;
  
    const lessonIndex = moduleData.lessons.findIndex(l => l.lessonId === lessonId);
    if (lessonIndex !== -1) {
      const lessonData = moduleData.lessons[lessonIndex];
      let prev = null;
      let next = null;

      if (lessonIndex > 0) {
        prev = { level, moduleId, lessonId: moduleData.lessons[lessonIndex - 1].lessonId, title: moduleData.lessons[lessonIndex - 1].title };
      } else {
        const moduleIndex = levelData.modules.findIndex(m => m.moduleId === moduleId);
        if (moduleIndex > 0) {
          const prevMod = levelData.modules[moduleIndex - 1];
          if (prevMod.lessons.length > 0) {
            prev = { level, moduleId: prevMod.moduleId, lessonId: prevMod.lessons[prevMod.lessons.length - 1].lessonId, title: prevMod.lessons[prevMod.lessons.length - 1].title };
          }
        } else if (level > 1) {
          const prevLevel = levels.find(l => l.level === level - 1);
          if (prevLevel && prevLevel.modules.length > 0) {
            const prevMod = prevLevel.modules[prevLevel.modules.length - 1];
            if (prevMod.lessons.length > 0) {
              prev = { level: prevLevel.level, moduleId: prevMod.moduleId, lessonId: prevMod.lessons[prevMod.lessons.length - 1].lessonId, title: prevMod.lessons[prevMod.lessons.length - 1].title };
            }
          }
        }
      }

      if (lessonIndex < moduleData.lessons.length - 1) {
        next = { level, moduleId, lessonId: moduleData.lessons[lessonIndex + 1].lessonId, title: moduleData.lessons[lessonIndex + 1].title };
      } else {
        const moduleIndex = levelData.modules.findIndex(m => m.moduleId === moduleId);
        if (moduleIndex !== -1 && moduleIndex < levelData.modules.length - 1) {
          const nextMod = levelData.modules[moduleIndex + 1];
          if (nextMod.lessons.length > 0) {
            next = { level, moduleId: nextMod.moduleId, lessonId: nextMod.lessons[0].lessonId, title: nextMod.lessons[0].title };
          }
        } else if (level < 3) {
          const nextLevel = levels.find(l => l.level === level + 1);
          if (nextLevel && nextLevel.modules.length > 0) {
            const nextMod = nextLevel.modules[0];
            if (nextMod.lessons.length > 0) {
              next = { level: nextLevel.level, moduleId: nextMod.moduleId, lessonId: nextMod.lessons[0].lessonId, title: nextMod.lessons[0].title };
            }
          }
        }
      }

      return {
        module: {
          moduleId: moduleData.moduleId,
          title: moduleData.title,
          finalModuleProject: moduleData.finalModuleProject,
        },
        lesson: lessonData,
        category: cat,
        prev,
        next
      };
    }
  }
  
  return null;
}
