import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
    title: "Cookie Policy - TechVerseHub",
    description: "Information about how TechVerseHub uses cookies to enhance your learning experience."
};

export default function CookiePolicy() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
                <article className="prose prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-8 gradient-text inline-block">Cookie Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 14, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">1. What Are Cookies?</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Cookies are simple text files that are stored on your computer or mobile device by a website's server. Each cookie is unique to your
                            web browser. It will contain some anonymous information such as a unique identifier and the site name and some digits and numbers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Cookies</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            We use cookies to improve your experience on our website, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300">
                            <li>Keeping you signed in.</li>
                            <li>Understanding how you use our website.</li>
                            <li>Saving your preferences and learning progress.</li>
                            <li>Personalizing content for you.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">3. Types of Cookies We Use</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-medium text-white mb-2">Essential Cookies</h3>
                                <p className="text-gray-300">
                                    These cookies are essential for the proper functioning of the website, such as for the authentication and security of your account.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-white mb-2">Functionality Cookies</h3>
                                <p className="text-gray-300">
                                    These allow the website to remember choices you make (such as your user name, language, or the region you are in) and provide enhanced features.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">4. Managing Cookies</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser,
                            and from version to version. You can however obtain up-to-date information about blocking and deleting cookies via these links:
                            Chrome, Firefox, Safari, and Edge.
                        </p>
                    </section>
                </article>
            </main>
            <Footer />
        </div>
    );
}
