import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">Welcome to TechVerse Hub</h1>
          <p className="text-2xl mb-8">Master coding with AI-powered interactive lessons and practice</p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" variant="secondary">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="default">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
