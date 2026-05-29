import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <div className="glass-card p-8 md:p-12 rounded-2xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                <p>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. User Accounts</h2>
                <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Intellectual Property</h2>
                <p>The Service and its original content, features and functionality are and will remain the exclusive property of PlacementReady and its licensors.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Termination</h2>
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
