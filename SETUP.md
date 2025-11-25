# TechVerse Hub - Setup Guide

## Overview
TechVerse Hub is an interactive coding education platform with AI-powered learning, LeetCode-style practice problems, and a Monaco code editor workspace.

## Features
- ✅ User authentication with Supabase
- ✅ 20 interactive lessons (10 Python + 10 JavaScript)
- ✅ 30 practice problems with progressive AI hints
- ✅ Monaco Editor with syntax highlighting
- ✅ Code execution for JavaScript and Python
- ✅ AI assistance (Groq + Gemini)
- ✅ Email notifications (Nodemailer)
- ✅ Dark/Light theme
- ✅ Responsive design

## Prerequisites
1. **Supabase Account**: Sign up at https://supabase.com
2. **Groq API Key**: Get one at https://console.groq.com
3. **Google Gemini API Key**: Get one at https://aistudio.google.com/app/apikey
4. **Gmail Account**: For SMTP email sending

## Environment Setup

### 1. Create `.env.local` file
Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 2. Supabase Database Setup

#### Create Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table (managed by Supabase Auth, but you can extend it)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  codeExample TEXT,
  tryStarter TEXT,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson Progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Practice Problems table
CREATE TABLE IF NOT EXISTS public.practice_problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  description TEXT NOT NULL,
  examples TEXT,
  solution TEXT,
  hints TEXT,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Cases table
CREATE TABLE IF NOT EXISTS public.testcases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id TEXT REFERENCES public.practice_problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT REFERENCES public.practice_problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status TEXT CHECK (status IN ('passed', 'failed')),
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  files JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for public read access to lessons and problems
CREATE POLICY "Lessons are viewable by everyone" 
  ON public.lessons FOR SELECT 
  USING (true);

CREATE POLICY "Problems are viewable by everyone" 
  ON public.practice_problems FOR SELECT 
  USING (true);

CREATE POLICY "Test cases are viewable by everyone" 
  ON public.testcases FOR SELECT 
  USING (true);

-- Policies for authenticated users
CREATE POLICY "Users can view own progress" 
  ON public.lesson_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
  ON public.lesson_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
  ON public.lesson_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own submissions" 
  ON public.submissions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" 
  ON public.submissions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own projects" 
  ON public.projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
  ON public.projects FOR UPDATE 
  USING (auth.uid() = user_id);
```

#### Seed Data
After creating tables, you need to seed them with the lesson and practice problem data. You can do this in two ways:

**Option 1: Manual Insert via Supabase Dashboard**
1. Go to your Supabase project > Table Editor
2. For each table (lessons, practice_problems, testcases), manually insert the data from the JSON files in the `data/` folder

**Option 2: Using Supabase API (Recommended)**
Create a seed script or use the Supabase JavaScript client to insert data:

```javascript
// Example: Insert lessons
import { supabase } from './lib/supabase';
import lessonsData from './data/lessons-seed.json';

async function seedLessons() {
  const { error } = await supabase.from('lessons').insert(lessonsData);
  if (error) console.error('Error seeding lessons:', error);
  else console.log('Lessons seeded successfully!');
}

seedLessons();
```

### 3. Gmail SMTP Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"
   - Use this password in your `.env.local` as `EMAIL_PASS`

### 4. API Keys Setup

#### Groq API
1. Visit https://console.groq.com
2. Sign up/Login
3. Generate an API key
4. Add to `.env.local` as `GROQ_API_KEY`

#### Gemini API
1. Visit https://aistudio.google.com/app/apikey
2. Create an API key
3. Add to `.env.local` as `GEMINI_API_KEY`

## Running the Application

### Development
```bash
npm install
npm run dev
```

The app will run on http://localhost:5000

### Build for Production
```bash
npm run build
npm start
```

## Project Structure
```
techverse-hub/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── learn/             # Learning module
│   ├── practice/          # Practice arena
│   ├── editor/            # Code editor workspace
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components (Button, Card, etc.)
│   ├── Navbar.tsx        # Navigation bar
│   ├── AdPanel.tsx       # Advertisement panel
│   └── theme-provider.tsx
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── data/                  # Seed data (JSON files)
└── public/               # Static assets
```

## Features Guide

### Authentication
- Signup: Create new account with email/password
- Login: Sign in with existing credentials
- Password Reset: Reset password via email link
- Welcome email sent upon signup

### Learning Module
- Browse 20 lessons (Python & JavaScript)
- Interactive code editor with syntax highlighting
- Run code directly in browser
- Track lesson completion progress

### Practice Arena
- 30 coding problems (Easy, Medium, Hard)
- Filter by difficulty
- Monaco Editor for coding solutions
- Run sample test cases
- Submit for full evaluation
- Progressive AI hints:
  - Small hint after 2 failed attempts
  - Bigger hint after 4 failed attempts
  - Full solution after 6 failed attempts

### Editor Workspace
- VS Code-style Monaco Editor
- AI-powered features:
  - Explain Code
  - Debug Code
  - Refactor Code
- Support for JavaScript and Python
- Real-time code execution

### AI Integration
**Groq (Llama models):**
- Code explanation
- Code debugging
- Code refactoring
- Practice hints
- Solution explanations

**Gemini (Flash 2.0):**
- Lesson explanations
- Concept simplification
- Quiz generation
- Study assistance

## Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check if tables are created and RLS policies are set

2. **Email not sending**
   - Verify Gmail app password (not regular password)
   - Check if 2FA is enabled on Gmail

3. **AI features not working**
   - Verify API keys are correct
   - Check API quota/limits

4. **Code execution errors**
   - Python: Ensure Python 3 is installed (`python3 --version`)
   - JavaScript: VM2 should work out of the box

## Deployment
This project is ready to deploy on Replit or any platform that supports Next.js:

### Replit
1. Push code to Replit
2. Set environment variables in Secrets tab
3. Click "Run"

### Vercel
1. Connect GitHub repository
2. Add environment variables
3. Deploy

## Support
For issues or questions:
- Check the setup guide above
- Review error logs in browser console
- Verify all environment variables are set correctly

## License
MIT License - Feel free to use this project for learning and development.
