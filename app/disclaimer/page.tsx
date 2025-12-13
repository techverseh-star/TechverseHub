import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
    title: "Disclaimer - TechVerseHub",
    description: "Disclaimer for educational content and code examples provided on TechVerseHub."
};

export default function Disclaimer() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
                <article className="prose prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-8 gradient-text inline-block">Disclaimer</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 14, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">1. Educational Purpose</h2>
                        <p className="text-gray-300 leading-relaxed">
                            The information provided by TechVerseHub ("we," "us," or "our") on our website is for general educational and informational purposes only.
                            All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied,
                            regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">2. Professional Disclaimer</h2>
                        <p className="text-gray-300 leading-relaxed">
                            The Site does not contain professional career or legal advice. The coding and development information is provided for educational purposes
                            only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage
                            you to consult with the appropriate professionals. We do not provide any kind of professional advice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">3. External Links Disclaimer</h2>
                        <p className="text-gray-300 leading-relaxed">
                            The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties.
                            Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
                        </p>
                    </section>
                </article>
            </main>
            <Footer />
        </div>
    );
}
