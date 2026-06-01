"use client";

import { use, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, CheckCircle2, Lightbulb, Clock, Database, Terminal, XCircle } from "lucide-react";
import Link from "next/link";
import { CodeEditor } from "@/components/code-editor";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [q, setQ] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchQ() {
      try {
        const docRef = doc(db, "questions", resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQ({ id: docSnap.id, ...docSnap.data() });
        } else {
          setQ(null);
        }
      } catch (e) {
        console.error("Error fetching question:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchQ();
  }, [resolvedParams.id]);

  // Anti-cheat: prevent copy/paste if disabled by admin
  useEffect(() => {
    if (!q || q.allowCopyPaste !== false) return;

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copy & Paste is disabled for this problem by the admin.");
    };

    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);

    return () => {
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
    };
  }, [q]);

  const handleRun = (out: string, err: string) => {
    setOutput(out);
    setError(err);
    setSubmitStatus("idle");
  };

  const handleSubmit = async (code: string, language: string, passed: boolean) => {
    try {
      setSubmitStatus("idle");
      await addDoc(collection(db, "submissions"), {
        questionId: resolvedParams.id,
        questionTitle: q.title,
        userId: user?.email || "Anonymous Student",
        code,
        language,
        status: passed ? "Passed" : "Failed",
        timestamp: new Date().toISOString()
      });
      setSubmitStatus(passed ? "success" : "error");
    } catch (e) {
      console.error("Error submitting code:", e);
      setSubmitStatus("error");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-muted/20 min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading question...</p>
        </main>
      </>
    );
  }

  if (!q) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-muted/20 min-h-screen flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">Question not found.</p>
          <Link href="/dsa" className={buttonVariants({ variant: "outline" })}>Back to Problems</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/20 min-h-screen flex flex-col" style={{ userSelect: q?.allowCopyPaste === false ? "none" : "auto" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] py-4 flex-1 flex flex-col">
          <Link href="/dsa" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 self-start")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Problems
          </Link>

          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* Left Panel: Question Details */}
            <div className="w-full lg:w-[45%] flex flex-col min-h-[500px]">
              <Card className="glass-card flex-1 flex flex-col overflow-hidden">
                <CardContent className="p-0 flex-1 overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-2xl font-bold">{q.title}</h1>
                      <CheckCircle2 className="text-green-500 w-6 h-6" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-6">
                      <Badge variant={q.difficulty === "Easy" ? "secondary" : q.difficulty === "Medium" ? "default" : "destructive"} className="bg-opacity-20">{q.difficulty}</Badge>
                      <Badge variant="outline">{q.category}</Badge>
                    </div>

                    <Tabs defaultValue="description" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4 sticky top-0 bg-background z-10">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="solution">Solution</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="description" className="space-y-6">
                        <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                          {q.description?.trim() || "No description provided."}
                        </div>

                        {q.testCases && q.testCases.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-primary" /> Test Cases
                            </h3>
                            {q.testCases.map((tc: any, i: number) => (
                              <div key={i} className="bg-muted/50 border p-4 rounded-lg font-mono text-xs space-y-2">
                                <div><strong className="text-foreground">Input:</strong><br />{tc.input}</div>
                                <div><strong className="text-foreground">Expected Output:</strong><br />{tc.output}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="solution">
                        {q.solution ? (
                          <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                            {q.solution.trim()}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No official solution provided for this question.</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Code Editor & Console */}
            <div className="w-full lg:w-[55%] flex flex-col gap-4 h-[800px] lg:h-auto min-h-[500px]">
              {/* Editor */}
              <div className="flex-1 min-h-[400px]">
                <CodeEditor 
                  testCases={q.testCases || []} 
                  onRun={handleRun} 
                  onSubmit={handleSubmit} 
                  allowCopyPaste={q.allowCopyPaste ?? true}
                />
              </div>
              
              {/* Output Console */}
              <Card className="h-64 flex flex-col overflow-hidden bg-[#1e1e1e] border-gray-800 rounded-md shrink-0">
                <div className="bg-muted/10 border-b border-gray-800 p-2 flex items-center gap-2 text-xs font-mono text-gray-400">
                  <Terminal className="w-4 h-4" /> Console Output
                  {submitStatus === "success" && <Badge className="ml-auto bg-green-600 text-white hover:bg-green-600">All Tests Passed & Submitted!</Badge>}
                  {submitStatus === "error" && <Badge variant="destructive" className="ml-auto flex items-center gap-1"><XCircle className="w-3 h-3"/> Failed / Submission Error</Badge>}
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                  {error ? (
                    <div className="text-red-400 whitespace-pre-wrap">{error}</div>
                  ) : output ? (
                    <div className="text-green-400 whitespace-pre-wrap">{output}</div>
                  ) : (
                    <div className="text-gray-600 italic">Run your code to see output here...</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
