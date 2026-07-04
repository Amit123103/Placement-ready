"use client";

import { useState, useEffect } from "react";
// Firebase imports
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";



interface Question {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description?: string;
  createdAt?: string;
}

export default function DSAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Arrays", "Strings", "Linked List", "Trees", "Dynamic Programming", "Graphs"];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "questions"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setQuestions(data);
      
      if (data.length === 0) {
        // Just an empty state if Firebase is working but empty
      }
    } catch (err: any) {
      console.error("Error fetching questions:", err);
      
      // Fallback mock data to keep the UI working
      const mockQuestions: Question[] = [
        { id: "m1", title: "Two Sum", difficulty: "Easy", category: "Arrays" },
        { id: "m2", title: "Reverse Linked List", difficulty: "Easy", category: "Linked List" },
        { id: "m3", title: "Merge K Sorted Lists", difficulty: "Hard", category: "Linked List" },
        { id: "m4", title: "Binary Tree Level Order Traversal", difficulty: "Medium", category: "Trees" },
        { id: "m5", title: "Longest Palindromic Substring", difficulty: "Medium", category: "Strings" },
        { id: "m6", title: "Climbing Stairs", difficulty: "Easy", category: "Dynamic Programming" },
        { id: "m7", title: "Course Schedule", difficulty: "Medium", category: "Graphs" },
      ];
      setQuestions(mockQuestions);

      if (err?.message?.includes("Missing or insufficient permissions") || err?.code === "permission-denied") {
        setError("Firebase permissions are missing! Loading mock data. (You must update your Firestore Rules in the Firebase Console to allow reads).");
      } else {
        setError("Could not connect to Firebase database. Loading mock data for now.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || q.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/20 min-h-screen">
        {/* Header Section */}
        <div className="bg-background border-b py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Structures & Algorithms</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Master the core concepts of computer science. Practice from our curated list of questions frequently asked by top tech companies.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar - Filters */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="glass-card p-5 rounded-xl">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Filter className="w-4 h-4 mr-2" /> Categories
              </h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      activeCategory === category 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Questions List */}
          <div className="flex-1 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Questions Grid */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground animate-pulse">
                Loading questions from database...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
                No questions found matching your criteria.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredQuestions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/dsa/${q.id}`}>
                      <div className="glass-card p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer border border-border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-base group-hover:text-primary transition-colors">
                                {q.title}
                              </span>
                              {q.createdAt && (
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                  Added on {new Date(q.createdAt).toLocaleDateString()} at {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-11 sm:ml-0">
                            <Badge variant={
                              q.difficulty === 'Easy' ? 'secondary' :
                              q.difficulty === 'Medium' ? 'default' : 'destructive'
                            } className="bg-opacity-20 text-opacity-90">
                              {q.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-muted-foreground">
                              {q.category}
                            </Badge>
                            <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
