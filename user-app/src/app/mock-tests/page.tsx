"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Timer, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

interface MockTest {
  id: string;
  title: string;
  category: string;
  duration: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard" | string;
  questionsCount: number;
  questions?: any[];
  createdAt?: string;
}

export default function MockTestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/mock-tests");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchTests() {
      try {
        const q = query(collection(db, "mockTests"), where("status", "==", "Published"));
        const snapshot = await getDocs(q);
        const data: MockTest[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          data.push({
            id: doc.id,
            title: d.title || "Untitled Test",
            category: "General", // Default if not in schema
            duration: parseInt(d.duration) || 60,
            difficulty: "Medium",
            questionsCount: Array.isArray(d.questions) ? d.questions.length : (typeof d.questions === "number" ? d.questions : 0),
          });
        });
        setTests(data);
      } catch (e) {
        console.error("Error fetching tests:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredTests = tests.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 min-h-screen relative overflow-hidden py-12">
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <AnimatePresence mode="wait">
              <motion.div
                key="listings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Assessment & <span className="text-primary">Mock Tests</span>
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Evaluate your skills in real-time. Practice custom tests with MCQ, Short Answer, and live Coding questions!
                  </p>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="relative w-full max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search mock tests..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-20 text-muted-foreground">Loading tests from database...</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTests.map((test, index) => (
                      <motion.div
                        key={test.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card flex flex-col p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md shadow-md hover:border-primary/45 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {test.category}
                          </Badge>
                          <Badge variant="secondary" className="bg-opacity-20 text-opacity-95">
                            {test.difficulty}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {test.title}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5">
                            <Timer className="w-4 h-4 text-muted-foreground" />
                            {test.duration} mins
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {test.questionsCount} Questions
                          </span>
                        </div>

                        {test.createdAt && (
                          <p className="text-[11px] text-muted-foreground/70 mb-4 text-center">
                            Added on {new Date(test.createdAt).toLocaleDateString()} at {new Date(test.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}

                        <Link
                          href={`/mock-tests/${test.id}/take`}
                          className="w-full mt-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 h-11 transition-all group-hover:translate-y-[-2px] shadow-lg shadow-primary/10"
                        >
                          Start Assessment
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </motion.div>
                    ))}

                    {filteredTests.length === 0 && (
                      <div className="col-span-full py-20 text-center text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border/80">
                        No published mock assessments found.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
