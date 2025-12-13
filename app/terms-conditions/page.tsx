import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
    title: "Terms & Conditions - TechVerseHub",
    description: "Review the Terms and Conditions for using the TechVerseHub learning platform."
};

export default function TermsConditions() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
                <article className="prose prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-8 gradient-text inline-block">Terms and Conditions</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 14, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">1. Agreement to Terms</h2>
                        <p className="text-gray-300 leading-relaxed">
                            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you")
                            and TechVerseHub ("we," "us" or "our"), concerning your access to and use of our website. By accessing the site, you confirm that you
                            have read, understood, and agreed to be bound by all of these Terms and Conditions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">2. Intellectual Property Rights</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs,
                            audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos
                            contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">3. User Representations</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            By using the Site, you represent and warrant that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300">
                            <li>All registration information you submit will be true, accurate, current, and complete.</li>
                            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                            <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
                            <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">4. Modifications and Interruptions</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice.
                            We also reserve the right to modify or discontinue all or part of the Site without notice at any time. We will not be liable to you or any
                            third party for any modification, price change, suspension, or discontinuance of the Site.
                        </p>
                    </section>
                </article>
            </main>
            <Footer />
        </div>
    );
}
