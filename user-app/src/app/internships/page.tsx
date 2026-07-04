"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Briefcase, Building, MapPin, FileText, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Internship {
  id: string;
  role: string;
  company: string;
  location: string;
  description: string;
  applyLink: string;
  type: string; // e.g. "Remote", "On-site"
  createdAt?: string;
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "internships"));
      const data: Internship[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Internship);
      });
      setInternships(data);
    } catch (err: any) {
      console.error("Error fetching internships:", err);
      
      // Fallback mock data
      setInternships([
        {
          id: "m1",
          role: "Software Engineering Intern",
          company: "Google",
          location: "Bangalore, India",
          description: "Join our team to build scalable software solutions.",
          applyLink: "#",
          type: "On-site"
        },
        {
          id: "m2",
          role: "Frontend Developer Intern",
          company: "Vercel",
          location: "Remote",
          description: "Work on cutting edge frontend frameworks.",
          applyLink: "#",
          type: "Remote"
        },
        {
          id: "m3",
          role: "Data Science Intern",
          company: "Microsoft",
          location: "Hyderabad, India",
          description: "Apply machine learning models to large datasets.",
          applyLink: "#",
          type: "Hybrid"
        }
      ]);

      if (err?.message?.includes("Missing or insufficient permissions") || err?.code === "permission-denied") {
        setError("Firebase permissions are missing. Loading mock data. Please update your Firestore Security Rules.");
      } else {
        setError("Could not connect to Firebase database. Loading mock data for now.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-muted/30 py-12 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Latest <span className="text-primary">Internships</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover and apply to top internship opportunities to kickstart your career.
            </p>
          </motion.div>

          {error && (
            <Alert variant="default" className="mb-8 border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {internships.map((internship, i) => (
                <motion.div
                  key={internship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="glass-card h-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{internship.role}</h3>
                        <div className="flex items-center text-muted-foreground font-medium">
                          <Building className="w-4 h-4 mr-2" />
                          {internship.company}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                        {internship.type}
                      </span>
                    </div>

                    <div className="space-y-3 my-6 flex-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-3 text-foreground/50" />
                        {internship.location}
                      </div>
                      <div className="flex items-start text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 mr-3 mt-0.5 text-foreground/50 shrink-0" />
                        <span className="line-clamp-3">{internship.description}</span>
                      </div>
                    </div>

                    {internship.createdAt && (
                      <p className="text-[11px] text-muted-foreground/70 mb-3 text-center">
                        Added on {new Date(internship.createdAt).toLocaleDateString()} at {new Date(internship.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}

                    <Button className="w-full group" asChild>
                      <a 
                        href={internship.applyLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!user) {
                            e.preventDefault();
                            router.push("/login");
                          }
                        }}
                      >
                        Apply Now
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {internships.length === 0 && !error && (
                <div className="col-span-full py-20 text-center text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border">
                  No internships posted yet. Check back later!
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
