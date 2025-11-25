# TechVerse Hub - Complete Setup Guide

## Build Real Skills With Real Practice

TechVerse Hub is an interactive coding education platform featuring 6 programming languages, 180+ practice problems, and AI-powered learning assistance.

## Platform Features

### Languages Supported
- **Python** - 15 lessons (Beginner to Advanced)
- **JavaScript** - 15 lessons (Beginner to Advanced)
- **TypeScript** - 8 lessons (Beginner to Advanced)
- **Java** - 8 lessons (Beginner to Advanced)
- **C** - 10 lessons (Beginner to Advanced)
- **C++** - 10 lessons (Beginner to Advanced)

### Core Features
- 66+ Interactive lessons with live code examples
- 180+ Practice problems (Easy, Medium, Hard)
- AI-powered code assistance (Groq + Gemini)
- Monaco Editor with syntax highlighting
- Real-time code execution (JavaScript/Python)
- User authentication with Supabase
- Progress tracking and XP system
- Dark/Light theme support
- Responsive design

---

## Prerequisites

Before setting up, you'll need accounts for:

1. **Supabase** - Database and authentication: https://supabase.com
2. **Groq** - AI for code assistance: https://console.groq.com
3. **Google AI Studio** - Gemini for learning: https://aistudio.google.com/app/apikey
4. **Gmail** - For email notifications (optional)

---

## Step 1: Environment Variables

Set these secrets in your Replit Secrets tab (or `.env.local` for local development):

### Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Optional (for email notifications)
```
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

---

## Step 2: Supabase Database Setup

### 2.1 Create Tables
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `scripts/create-tables.sql`
4. Run the SQL script

This creates all necessary tables with proper indexes and Row Level Security policies.

### 2.2 Seed the Database
After creating tables, seed with lesson and problem data:

**Option A: Using the Seed Script (Recommended)**
```bash
# Make sure SUPABASE_SERVICE_ROLE_KEY is set
node scripts/seed-database.js
```

**Option B: Manual Import**
1. Go to Supabase Dashboard > Table Editor
2. For `lessons` table: Import from `data/lessons-seed.json`
3. For `problems` table: Import from `data/practice-problems.json`
4. For `testcases` table: Import from `data/testcases.json`

---

## Step 3: API Keys Configuration

### Groq API (Code Assistance)
1. Visit https://console.groq.com
2. Sign up or login
3. Go to API Keys section
4. Generate a new API key
5. Add to secrets as `GROQ_API_KEY`

**Used for:**
- Code explanations
- Debugging assistance
- Code refactoring suggestions
- Practice problem hints

### Gemini API (Learning Assistance)
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Create a new API key
4. Add to secrets as `GEMINI_API_KEY`

**Used for:**
- Lesson explanations
- Concept simplification
- Interactive Q&A

---

## Step 4: Email Setup (Optional)

For password reset emails and notifications:

### Gmail App Password
1. Go to your Google Account settings
2. Security > 2-Step Verification (enable if not already)
3. App passwords > Generate new
4. Select "Mail" as the app
5. Copy the 16-character password
6. Add to secrets:
   - `EMAIL_USER` = your Gmail address
   - `EMAIL_PASS` = the app password (not your regular password)

---

## Step 5: Run the Application

### Development
```bash
npm install
npm run dev
```

The app runs on http://localhost:5000

### Production Build
```bash
npm run build
npm start
```

---

## Project Structure

```
techverse-hub/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (execute, ai, email)
│   ├── auth/              # Login, Signup, Reset pages
│   ├── dashboard/         # User dashboard with stats
│   ├── learn/             # Interactive lessons
│   ├── practice/          # Coding challenges
│   ├── projects/          # Real-world projects
│   └── editor/            # AI-powered code editor
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── Navbar.tsx        # Navigation
├── lib/                   # Utilities
│   └── supabase.ts       # Supabase client
├── data/                  # Seed data files
│   ├── lessons-seed.json
│   ├── practice-problems.json
│   └── testcases.json
├── scripts/               # Database scripts
│   ├── create-tables.sql
│   └── seed-database.js
└── public/               # Static assets
```

---

## Features Overview

### Learning Module (`/learn`)
- Browse lessons by language
- Filter by difficulty level
- Interactive code examples
- "Try It Yourself" editor
- AI-powered explanations

### Practice Arena (`/practice`)
- 180+ coding problems
- Filter by language and difficulty
- Monaco Editor for solutions
- Run code against test cases
- Progressive hint system:
  - Hint after 2 failed attempts
  - Bigger hint after 4 attempts
  - Solution after 6 attempts

### Projects Page (`/projects`)
- Real-world project guides
- Beginner to Advanced levels
- Step-by-step instructions
- Technologies and prerequisites

### Editor Workspace (`/editor`)
- Full-featured Monaco Editor
- AI assistance tools:
  - Explain Code
  - Debug Code
  - Refactor Code
- Real-time execution

### Dashboard (`/dashboard`)
- Progress tracking
- XP and streak system
- Language progress
- Recent activity
- Quick actions

---

## AI Integration

### Groq (Llama 3.3 70B)
- Fast inference for code tasks
- Code explanation and debugging
- Refactoring suggestions
- Practice hints

### Gemini (Flash 2.0)
- Learning assistance
- Concept explanations
- Interactive tutoring

---

## Troubleshooting

### Database Issues
- **Tables not found**: Run `scripts/create-tables.sql` in Supabase SQL Editor
- **Permission denied**: Check RLS policies are enabled
- **Seed failed**: Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

### Authentication Issues
- **Signup fails**: Check Supabase URL and anon key
- **Email not sent**: Verify Gmail app password (2FA must be enabled)

### AI Features
- **Not responding**: Check API keys are valid
- **Rate limited**: Wait and retry, or check quota

### Code Execution
- **Python errors**: Ensure Python 3 is available
- **Timeout**: Code must complete within 3 seconds

---

## Deployment Checklist

Before publishing, ensure:

- [ ] All environment variables are set in production
- [ ] Database tables created and seeded
- [ ] Supabase RLS policies enabled
- [ ] API keys are valid and have quota
- [ ] Test signup/login flow
- [ ] Test code execution
- [ ] Test AI features
- [ ] Verify responsive design

---

## Publishing on Replit

1. Click the **Publish** button in Replit
2. Configure your domain (optional custom domain)
3. Ensure all secrets are set for production
4. Deploy!

Your TechVerse Hub will be live and accessible to users worldwide.

---

## Support

For issues:
1. Check browser console for errors
2. Verify environment variables
3. Check Supabase logs for database errors
4. Review this setup guide

---

**TechVerse Hub - Build Real Skills With Real Practice**
