"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { FileText, Download, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Note {
  id: string;
  title: string;
  subject: string;
  description: string;
  downloadLink: string;
  createdAt?: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "notes"));
      const data: Note[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(data);
    } catch (err: any) {
      console.error("Error fetching notes:", err);
      
      // Fallback mock data
      setNotes([
        {
          id: "m1",
          title: "Operating Systems Quick Revision",
          subject: "Operating Systems",
          description: "A comprehensive cheatsheet covering processes, threads, scheduling algorithms, and memory management for interviews.",
          downloadLink: "#"
        },
        {
          id: "m2",
          title: "DBMS SQL Queries Masterclass",
          subject: "DBMS",
          description: "Top 50 SQL queries asked in product-based companies, with normalization and ACID properties.",
          downloadLink: "#"
        },
        {
          id: "m3",
          title: "Computer Networks Protocols",
          subject: "Computer Networks",
          description: "Detailed notes on OSI model, TCP/IP, and essential network protocols.",
          downloadLink: "#"
        },
        {
          id: "m4",
          title: "System Design Fundamentals",
          subject: "System Design",
          description: "Load balancing, caching, sharding, and CAP theorem explained simply.",
          downloadLink: "#"
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
          <div className="absolute top-0 -left-20 w-96 h-96 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute top-40 right-10 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Study <span className="text-primary">Notes</span> & Materials
            </h1>
            <p className="text-lg text-muted-foreground">
              Download premium revision notes to quickly brush up your core CS subjects before interviews.
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
            <div className="grid gap-6 md:grid-cols-2">
              {notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="glass-card p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm flex items-start gap-4 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {note.subject}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{note.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {note.description}
                      </p>
                      {note.createdAt && (
                        <p className="text-[11px] text-muted-foreground/70 mb-3">
                          Added on {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      <Button variant="secondary" size="sm" className="group" asChild>
                        <a href={note.downloadLink} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {notes.length === 0 && !error && (
                <div className="col-span-full py-20 text-center text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border">
                  No notes available yet. Check back later!
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
