import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <div className="glass-card p-8 md:p-12 rounded-2xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                <p>We collect information you provide directly to us when you create an account, participate in any interactive features of our services, fill out a form, request customer support or otherwise communicate with us.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                <p>We may use information about you for various purposes, including to provide, maintain and improve our services, develop new products and services, and personalize the services for you.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Security</h2>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Cookies</h2>
                <p>We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
