"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, Phone, CheckCircle2, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Have questions about our platform? Need help with your account? We're here to help. Reach out to our team.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="md:col-span-1 space-y-6">
                <div className="glass-card p-6 rounded-xl flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-sm text-muted-foreground mb-2">Our friendly team is here to help.</p>
                    <a href="mailto:rik0rik8957@gmail.com" className="text-sm font-medium hover:text-primary transition-colors">rik0rik8957@gmail.com</a>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <p className="text-sm text-muted-foreground mb-2">Mon-Fri from 8am to 5pm.</p>
                    <a href="tel:+918960061745" className="text-sm font-medium hover:text-primary transition-colors">+91-8960061745</a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="md:col-span-2">
                <div className="glass-card p-8 rounded-2xl h-full">
                  <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
                  
                  {success && (
                    <div className="mb-6 p-4 rounded-lg bg-green-500/15 border border-green-500/20 text-green-500 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5" />
                      <p>Thank you! Your message has been successfully sent to rik0rik8957@gmail.com.</p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 rounded-lg bg-destructive/15 border border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First name</label>
                        <Input name="firstName" required placeholder="First name" className="bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last name</label>
                        <Input name="lastName" placeholder="Last name" className="bg-background/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input name="email" type="email" required placeholder="you@company.com" className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <textarea 
                        name="message"
                        required
                        className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] resize-y"
                        placeholder="Leave us a message..."
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
