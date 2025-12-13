import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
    title: "Privacy Policy - TechVerseHub",
    description: "Read our Privacy Policy to understand how TechVerseHub collects, uses, and protects your personal information."
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
                <article className="prose prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-8 gradient-text inline-block">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 14, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Welcome to TechVerseHub ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                            and use our educational platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
                        <div className="space-y-4 text-gray-300">
                            <p>We collect information that you provide directly to us when you register, such as:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Name and contact data (email address).</li>
                                <li>Account credentials (passwords, security information).</li>
                                <li>Profile data (learning progress, completed challenges, project submissions).</li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            We use the information we collect to operate, maintain, and improve our services. Specifically, we use it to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300">
                            <li>Manage your account and registration.</li>
                            <li>Track your learning progress and provide personalized recommendations.</li>
                            <li>Respond to your comments, questions, and customer service requests.</li>
                            <li>Send you technical notices, updates, security alerts, and administrative messages.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
                        <p className="text-gray-300 leading-relaxed">
                            We assume the security of your data is paramount. We implement appropriate technical and organizational security measures
                            designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee
                            that the internet itself is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">5. Contact Us</h2>
                        <p className="text-gray-300 leading-relaxed">
                            If you have questions or comments about this policy, you may contact us at <a href="mailto:support@techversehub.com" className="text-primary hover:underline">support@techversehub.com</a>.
                        </p>
                    </section>
                </article>
            </main>
            <Footer />
        </div>
    );
}
