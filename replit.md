# TechVerse Hub - Replit Project

## Project Overview
TechVerse Hub is an interactive coding education platform with the slogan **"Build Real Skills With Real Practice"**. Built with Next.js 14, featuring AI-powered learning, 180+ practice problems, and a Monaco code editor workspace.

## Recent Changes (November 25, 2025)
- Complete Next.js 14 application built from scratch
- Implemented authentication with Supabase (signup, login, password reset)
- **6 programming languages**: Python, JavaScript, TypeScript, Java, C, C++
- **66+ interactive lessons** with theory, examples, and practice exercises
- **180+ practice problems** (30 per language across Easy, Medium, Hard)
- **Projects page** with real-world application building guides
- Integrated Monaco Editor for code editing
- Implemented code execution API for JavaScript and Python
- Added Groq API integration (Llama 3.3 70B) for code assistance
- Added Gemini API integration (Flash 2.0) for learning assistance
- Built email system with Nodemailer
- Created responsive UI with dark/light theme
- Enhanced Dashboard with activity tracking and XP system
- **Comprehensive SEO optimization** with meta tags, Open Graph, and structured data
- **Database seed scripts** for automated setup
- Workflow configured and running on port 5000

### UX Improvements (Latest)
- **Loading spinners** on all pages during data fetching
- **W3Schools-style navigation** with Next/Previous buttons on Learn and Practice pages
- **Completion tracking** displays (e.g., "3/15 completed") on all relevant pages
- **Demo mode** works properly with comprehensive sample data when Supabase is not configured
- **Language-filtered navigation** - Next/Previous stays within the same programming language
- **Dashboard progress tracking** with accurate lesson prefix matching (py-, js-, ts-, java-, c-, cpp-)

## Platform Slogan
**"Build Real Skills With Real Practice"** - Featured on homepage and dashboard

## Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Shadcn UI components
- **Theme**: Dark/light mode with next-themes
- **Editor**: Monaco Editor (@monaco-editor/react)

### Backend
- **API Routes**: Next.js API routes for code execution, AI, and email
- **Authentication**: Supabase Auth with JWT sessions
- **Database**: Supabase (PostgreSQL) with Row Level Security

### AI Integration
- **Groq (Llama 3.3 70B)**: Code explanation, debugging, refactoring, practice hints
- **Gemini (Flash 2.0)**: Lesson explanations, concept simplification, study help

### Code Execution
- **JavaScript**: VM2 sandbox with 3-second timeout
- **Python**: Child process with python3, 3-second timeout

## Project Structure
```
├── app/                   # Next.js App Router
│   ├── api/              # API routes (execute, ai, email)
│   ├── auth/             # Auth pages (login, signup, reset)
│   ├── dashboard/        # Dashboard with stats
│   ├── learn/            # Learning module (6 languages)
│   ├── practice/         # Practice arena (180+ problems)
│   ├── projects/         # Real-world projects
│   └── editor/           # AI-powered editor workspace
├── components/           # React components
├── lib/                  # Utilities
├── data/                 # Seed data (JSON files)
│   ├── lessons-seed.json
│   ├── practice-problems.json
│   └── testcases.json
├── scripts/              # Database scripts
│   ├── create-tables.sql
│   └── seed-database.js
└── public/              # Static assets
```

## Learning Content

### Languages Covered
1. **Python** - 15 lessons (Beginner to Advanced)
2. **JavaScript** - 15 lessons (Beginner to Advanced)
3. **TypeScript** - 8 lessons (Beginner to Advanced)
4. **Java** - 8 lessons (Beginner to Advanced)
5. **C** - 10 lessons (Beginner to Advanced)
6. **C++** - 10 lessons (Beginner to Advanced)

### Lesson Levels
- **Beginner**: Basics, variables, control flow, loops
- **Intermediate**: Functions, OOP, data structures
- **Advanced**: Advanced features, patterns, best practices

### Practice Problems
- 30 problems per language (10 Easy, 10 Medium, 10 Hard)
- Progressive AI hints (after 2, 4, 6 failed attempts)
- Test case validation
- Solution explanations

### Projects
Real-world projects for each language:
- Beginner: CLI tools, simple apps
- Intermediate: APIs, databases, web servers
- Advanced: Full-stack apps, distributed systems

## Required Setup

### Environment Variables (Secrets)
```
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY     # For seeding database
GROQ_API_KEY                  # Groq API for code AI
GEMINI_API_KEY                # Google Gemini for learning AI
EMAIL_USER                    # Gmail address (optional)
EMAIL_PASS                    # Gmail app password (optional)
```

### Supabase Setup
1. Create Supabase project at https://supabase.com
2. Run `scripts/create-tables.sql` in SQL Editor
3. Run `node scripts/seed-database.js` to seed data
4. Or manually import from `data/` folder

## SEO Features
- Complete meta tags with keywords
- Open Graph for social sharing
- Twitter cards
- Structured data (JSON-LD)
- Semantic HTML
- Mobile-responsive design

## Development Notes

### Port Configuration
- Application runs on port 5000 (configured in package.json)
- Workflow configured to expose port 5000 as webview

### Dependencies
All required dependencies installed via npm:
- Next.js 14, React, TypeScript
- Supabase client
- Groq SDK, Google Generative AI
- Monaco Editor
- Nodemailer, VM2
- Tailwind CSS, Shadcn UI utilities

### Code Execution
- JavaScript runs in isolated VM2 sandbox
- Python executes via child_process with python3
- Both have 3-second timeout limits

## User Preferences
None specified yet.

## Pre-Publish Checklist
- [ ] Set all environment variables in Replit Secrets
- [ ] Create Supabase database and run schema
- [ ] Seed database with lessons and problems
- [ ] Test authentication flow
- [ ] Test code execution
- [ ] Test AI features
- [ ] Verify all pages render correctly
- [ ] Click Publish button

## Known Issues
None currently. Application is fully functional pending user setup of external services.

## Important Notes
- The application requires external services (Supabase, Groq, Gemini)
- Users must configure these services before the app will be fully functional
- Detailed setup instructions are in SETUP.md
- All seed data is provided in data/ folder
- Demo mode works without Supabase (shows sample data)
