export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    image: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        id: "getting-started-web-dev-2025",
        title: "Getting Started with Web Development in 2025",
        excerpt: "The landscape of web development is constantly evolving. Here is your comprehensive guide to the essential tools, frameworks, and skills needed to become a modern full-stack developer this year.",
        content: "Content placeholder...",
        author: "Keshav Agarwal",
        date: "December 12, 2025",
        readTime: "8 min read",
        category: "Career",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072"
    },
    {
        id: "mastering-react-hooks",
        title: "Mastering React Hooks: Beyond the Basics",
        excerpt: "Deep dive into advanced React hooks patterns. Learn how to create custom hooks, optimize performance with useMemo and useCallback, and manage complex state logic effectively.",
        content: "Content placeholder...",
        author: "Mayank Prajapati",
        date: "December 10, 2025",
        readTime: "12 min read",
        category: "Frontend",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=2070"
    },
    {
        id: "system-design-interview-prep",
        title: "Cracking the System Design Interview",
        excerpt: "System design interviews can be daunting. We break down the core concepts of scalability, load balancing, database sharding, and caching to help you ace your next big tech interview.",
        content: "Content placeholder...",
        author: "TechVerse Team",
        date: "December 08, 2025",
        readTime: "15 min read",
        category: "Interviews",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070"
    },
    {
        id: "typescript-best-practices",
        title: "TypeScript Best Practices for Large Scale Apps",
        excerpt: "Ensure type safety and maintainability in large codebases. Explore strict mode, generic constraints, utility types, and how to effectively avoid the 'any' type.",
        content: "Content placeholder...",
        author: "Keshav Agarwal",
        date: "December 05, 2025",
        readTime: "10 min read",
        category: "Development",
        image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=2128"
    },
    {
        id: "future-of-ai-coding",
        title: "The Future of AI in Coding: Assistant or Replacement?",
        excerpt: "AI tools like Copilot and Gemini are changing how we write code. We analyze the impact of AI on developer productivity and verify if it's a threat or a superpower.",
        content: "Content placeholder...",
        author: "Mayank Prajapati",
        date: "December 01, 2025",
        readTime: "6 min read",
        category: "AI & Tech",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1965"
    },
    {
        id: "css-grid-vs-flexbox",
        title: "CSS Grid vs Flexbox: When to Use Which?",
        excerpt: "Stop guessing which layout module to use. We provide clear examples and use-cases for both Grid and Flexbox to help you build responsive layouts with confidence.",
        content: "Content placeholder...",
        author: "TechVerse Team",
        date: "November 28, 2025",
        readTime: "7 min read",
        category: "Design",
        image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=2070"
    }
];
