# TechVerse Hub

An interactive coding education platform with AI-powered learning, practice problems, and code editor workspace.

## Features

- 🔐 **Authentication** - Secure signup/login with Supabase
- 📚 **Interactive Lessons** - 20 lessons covering Python and JavaScript fundamentals
- 💻 **Practice Arena** - 30 LeetCode-style coding challenges with difficulty levels
- 🤖 **AI Assistance** - Powered by Groq (Llama) and Gemini for code help and hints
- ⚡ **Code Editor** - Monaco Editor with syntax highlighting and code execution
- 📊 **Progress Tracking** - Track lessons completed and problems solved
- 📧 **Email Notifications** - Welcome emails, password resets, and reminders
- 🎨 **Modern UI** - Responsive design with dark/light theme support
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Shadcn UI
- **Editor**: Monaco Editor (VS Code editor)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq SDK (Llama 3.1 70B, Llama 3.2 11B), Google Gemini (Flash 1.5)
- **Email**: Nodemailer (Gmail SMTP)
- **Code Execution**: VM2 (JavaScript), Python subprocess
- **Styling**: Tailwind CSS, next-themes

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

Fill in your credentials:
- Supabase URL and Anon Key
- Groq API Key
- Gemini API Key
- Gmail credentials for SMTP

### 3. Setup Supabase Database
Follow the instructions in `SETUP.md` to:
- Create database tables
- Set up Row Level Security policies
- Seed initial data (lessons, problems, test cases)

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Project Structure

```
techverse-hub/
├── app/                   # Next.js App Router
│   ├── api/              # API routes (code execution, AI, email)
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard
│   ├── learn/            # Learning module
│   ├── practice/         # Practice arena
│   └── editor/           # Code editor workspace
├── components/           # React components
│   ├── ui/              # UI components (shadcn)
│   ├── Navbar.tsx       # Navigation bar
│   └── AdPanel.tsx      # Advertisement panel
├── lib/                  # Utilities
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper functions
├── data/                 # Seed data (JSON)
└── public/              # Static assets
```

## Key Features

### Learning Module
- Browse and filter lessons by language (Python/JavaScript)
- Interactive code editor with "Try It Yourself" section
- Run code directly in the browser
- Mark lessons as complete and track progress

### Practice Arena
- 30 coding problems across 3 difficulty levels (Easy, Medium, Hard)
- Monaco Editor for writing solutions
- Run sample test cases before submitting
- Submit for full evaluation against hidden test cases
- **Progressive AI Hints**:
  - Small hint after 2 failed attempts
  - Bigger hint after 4 failed attempts
  - Full solution explanation after 6 failed attempts

### Editor Workspace
- Full-featured Monaco Editor (VS Code)
- AI-powered code assistance:
  - **Explain Code** - Get detailed explanations
  - **Debug Code** - Find and fix issues
  - **Refactor Code** - Improve code quality
- Support for JavaScript and Python
- Real-time code execution

### AI Integration
**Groq (Llama Models)**:
- Code explanation, debugging, and refactoring
- Progressive hints for practice problems
- Solution explanations

**Gemini (Flash 1.5)**:
- Lesson explanations
- Concept simplification
- Quiz generation
- Study assistance

## API Routes

- `POST /api/run` - Execute JavaScript or Python code
- `POST /api/ai/groq` - Groq AI tasks (code assistance, hints)
- `POST /api/ai/gemini` - Gemini AI tasks (learning assistance)
- `POST /api/email/welcome` - Send welcome email
- `POST /api/email/reset` - Send password reset email
- `POST /api/email/reminder` - Send practice reminder email

## Database Schema

- **users** - User profiles
- **lessons** - Learning content
- **lesson_progress** - Track lesson completion
- **practice_problems** - Coding challenges
- **testcases** - Problem test cases (sample + hidden)
- **submissions** - User code submissions
- **projects** - User workspace projects

## Setup Guide

For detailed setup instructions, including:
- Supabase configuration
- Database schema creation
- Row Level Security policies
- Seed data insertion
- API key setup

Please refer to [`SETUP.md`](./SETUP.md)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This project is ready to deploy on:
- **Replit** - Set environment secrets and click "Run"
- **Vercel** - Connect repo and add environment variables
- **Any Node.js hosting** - Supports Next.js 14

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## Contributing

This is an educational project. Feel free to:
- Add more lessons and practice problems
- Improve AI prompts and responses
- Enhance UI/UX
- Add new features

## License

MIT License - Free to use for learning and development.

## Support

For setup help or issues:
1. Check `SETUP.md` for detailed instructions
2. Verify all environment variables are set
3. Check browser console for errors
4. Review Supabase logs for database issues

---

Built with ❤️ for aspiring developers
