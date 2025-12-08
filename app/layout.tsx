import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://techversehub.com'),
  title: {
    default: "TechVerse Hub - Build Real Skills With Real Practice",
    template: "%s | TechVerse Hub"
  },
  description: "Master programming with 6 languages, 66+ interactive lessons, 180+ coding challenges, and AI-powered assistance. Learn Python, JavaScript, TypeScript, Java, C, and C++ from beginner to advanced.",
  keywords: [
    "learn programming",
    "coding tutorials",
    "Python tutorial",
    "JavaScript tutorial",
    "TypeScript tutorial",
    "Java tutorial",
    "C programming",
    "C++ programming",
    "coding practice",
    "programming challenges",
    "AI coding assistant",
    "learn to code",
    "coding bootcamp",
    "programming courses",
    "code editor online",
    "interactive coding",
    "coding education platform"
  ],
  authors: [{ name: "TechVerse Hub" }],
  creator: "TechVerse Hub",
  publisher: "TechVerse Hub",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TechVerse Hub",
    title: "TechVerse Hub - Build Real Skills With Real Practice",
    description: "Master programming with 6 languages, 66+ interactive lessons, 180+ coding challenges, and AI-powered assistance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TechVerse Hub - Learn to Code",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechVerse Hub - Build Real Skills With Real Practice",
    description: "Master programming with 6 languages, 66+ interactive lessons, 180+ coding challenges, and AI-powered assistance.",
    images: ["/og-image.png"],
    creator: "@techversehub",
  },
  category: "Education",
  classification: "Programming Education Platform",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "TechVerse Hub",
  description: "Interactive coding education platform with AI-powered learning",
  url: "https://techversehub.com",
  sameAs: [],
  offers: {
    "@type": "Offer",
    category: "Programming Courses",
    description: "Free and premium coding courses"
  },
  hasCourseInstance: [
    {
      "@type": "Course",
      name: "Python Programming",
      description: "Learn Python from basics to advanced"
    },
    {
      "@type": "Course",
      name: "JavaScript Programming",
      description: "Master JavaScript for web development"
    },
    {
      "@type": "Course",
      name: "TypeScript Programming",
      description: "Learn TypeScript for type-safe development"
    },
    {
      "@type": "Course",
      name: "Java Programming",
      description: "Enterprise Java development"
    },
    {
      "@type": "Course",
      name: "C Programming",
      description: "Systems programming with C"
    },
    {
      "@type": "Course",
      name: "C++ Programming",
      description: "High-performance C++ development"
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3928367405059176"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-BHX2HDF43W"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-BHX2HDF43W');
          `}
        </Script>

        <link rel="canonical" href="https://techversehub.com" />

      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
