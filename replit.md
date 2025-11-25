# TechVerse Hub - Replit Project

## Project Overview
TechVerse Hub is an interactive coding education platform built with Next.js 14, featuring AI-powered learning, LeetCode-style practice problems, and a Monaco code editor workspace.

## Recent Changes (November 25, 2025)
- ✅ Complete Next.js 14 application built from scratch
- ✅ Implemented authentication with Supabase (signup, login, password reset)
- ✅ **Expanded to 6 programming languages**: Python, JavaScript, TypeScript, Java, Go, Rust
- ✅ **W3Schools-style learning**: Theory, examples, and practice from basics to advanced
- ✅ **180+ practice problems** (30 per language across Easy, Medium, Hard difficulties)
- ✅ **New Projects page** with real-world application building guides
- ✅ Integrated Monaco Editor for code editing
- ✅ Implemented code execution API for JavaScript and Python
- ✅ Added Groq API integration for code assistance
- ✅ Added Gemini API integration for learning assistance
- ✅ Built email system with Nodemailer
- ✅ Created responsive UI with dark/light theme
- ✅ Enhanced Dashboard with activity tracking and XP system
- ✅ Workflow configured and running on port 5000
- ✅ **Design upgraded to modern GitHub/Next.js aesthetic** with:
  - Dark theme with gradient text effects
  - Glass-card effects with blur backgrounds
  - Refined color palette (deep blue accents, professional grays)
  - Modern navigation with sticky header
  - Polished cards with hover glow effects
  - Professional typography and spacing

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
- **Groq**: Code explanation, debugging, refactoring, practice hints
- **Gemini**: Lesson explanations, concept simplification, study help

### Code Execution
- **JavaScript**: VM2 sandbox with 3-second timeout
- **Python**: Child process with timeout

## Project Structure
```
├── app/                   # Next.js App Router
│   ├── api/              # API routes
│   ├── auth/             # Auth pages
│   ├── dashboard/        # Dashboard with stats
│   ├── learn/            # Learning module (6 languages)
│   ├── practice/         # Practice arena (180+ problems)
│   ├── projects/         # Real-world projects
│   └── editor/           # AI-powered editor workspace
├── components/           # React components
├── lib/                  # Utilities
├── data/                 # Seed data
└── public/              # Static assets
```

## Learning Content

### Languages Covered
1. **Python** - 15 lessons (Beginner to Advanced)
2. **JavaScript** - 15 lessons (Beginner to Advanced)
3. **TypeScript** - 8 lessons (Beginner to Advanced)
4. **Java** - 8 lessons (Beginner to Advanced)
5. **Go** - 8 lessons (Beginner to Advanced)
6. **Rust** - 8 lessons (Beginner to Advanced)

### Lesson Levels
- **Beginner**: Basics, variables, control flow, loops
- **Intermediate**: Functions, OOP, data structures
- **Advanced**: Advanced features, patterns, best practices

### Practice Problems
- 30 problems per language (10 Easy, 10 Medium, 10 Hard)
- Progressive AI hints
- Test case validation
- Solution explanations

### Projects
Real-world projects for each language:
- Beginner: CLI tools, simple apps
- Intermediate: APIs, databases, web servers
- Advanced: Full-stack apps, distributed systems

## Required Setup

### Environment Variables
Users need to set these in Replit Secrets:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GROQ_API_KEY` - Groq API key for Llama models
- `GEMINI_API_KEY` - Google Gemini API key
- `EMAIL_USER` - Gmail address for SMTP
- `EMAIL_PASS` - Gmail app password

### Supabase Setup
1. Create Supabase project
2. Run SQL schema from SETUP.md
3. Insert seed data from data/ folder
4. Enable Row Level Security policies

## User Preferences
None specified yet.

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

## Next Steps / Future Enhancements
- Add real-time collaborative coding
- Implement achievement badges and leaderboards
- Add video tutorial integration
- Create advanced analytics dashboard
- Add code playground with project saving
- Implement social features (sharing solutions)

## Known Issues
None currently. Application is fully functional pending:
1. User setting up environment variables
2. User creating Supabase database and seeding data

## Important Notes
- The application requires external services (Supabase, Groq, Gemini, Gmail)
- Users must configure these services before the app will be fully functional
- Detailed setup instructions are in SETUP.md
- All seed data is provided in data/ folder
- Demo mode works without Supabase (shows sample data)
