"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, ArrowRight, ArrowLeft, CheckCircle2, Terminal, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { CodeEditor } from "@/components/code-editor";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

export default function TakeMockTestPage() {
  const params = useParams();
  const resolvedId = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTest, setActiveTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [codeScores, setCodeScores] = useState<Record<string, boolean>>({});
  const [codeDetails, setCodeDetails] = useState<Record<string, any>>({});
  const [consoleOutput, setConsoleOutput] = useState("");
  const [consoleError, setConsoleError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  
  // Output logs for code execution in test
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/mock-tests");
    }
  }, [user, authLoading, router]);

  // Anti-cheat enforcement
  useEffect(() => {
    if (!activeTest || !isTestRunning) return;

    const allowCopyPaste = activeTest.allowCopyPaste ?? false;
    const allowTabSwitching = activeTest.allowTabSwitching ?? false;

    const handleCopyPaste = (e: ClipboardEvent) => {
      if (!allowCopyPaste) {
        e.preventDefault();
        toast.error("Copy & Paste is disabled for this test by the admin.");
      }
    };

    const handleVisibilityChange = () => {
      if (!allowTabSwitching && document.hidden) {
        setTabSwitchWarnings(prev => prev + 1);
        toast.error("Warning: Tab switching is not allowed during this test!", { duration: 5000 });
      }
    };

    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeTest, isTestRunning]);

  useEffect(() => {
    async function fetchTest() {
      if (!resolvedId) return;
      try {
        const docRef = doc(db, "mockTests", resolvedId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as any;
          // Ensure questions is always an array
          if (!Array.isArray(data.questions)) {
            data.questions = [];
          }
          setActiveTest(data);
          setTimeLeft((parseInt(data.duration) || 60) * 60);
        } else {
          router.push("/mock-tests");
        }
      } catch (e) {
        console.error("Error fetching test:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [resolvedId, router]);

  useEffect(() => {
    if (!isTestRunning || timeLeft <= 0) {
      if (isTestRunning && timeLeft <= 0) {
        handleSubmitTest();
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isTestRunning, timeLeft]);

  const handleSelectOption = (questionId: string, value: any) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCodeRun = (out: string, err: string) => {
    setConsoleOutput(out);
    setConsoleError(err);
  };

  const handleCodeSubmit = (questionId: string, code: string, language: string, passed: boolean, testResults?: any[]) => {
    handleSelectOption(questionId, code);
    setCodeScores((prev) => ({ ...prev, [questionId]: passed }));
    setCodeDetails((prev) => ({ ...prev, [questionId]: { language, passed, testResults } }));
    setConsoleOutput(passed ? "All test cases passed! Answer saved." : "Some test cases failed. Answer saved anyway.");
    setConsoleError("");
  };

  const handleSubmitTest = async () => {
    if (!activeTest || !user) return;
    setIsTestRunning(false);
    setIsSubmitting(true);
    
    // Auto-grade MCQs and Code
    let totalScoreObtained = 0;
    let maxPossibleScore = 0;
    const scores: Record<string, number> = {};

    (activeTest.questions || []).forEach((q: any) => {
      maxPossibleScore += q.marks || 1;
      let qScore = 0;
      
      if (q.type === "mcq") {
        if (selectedAnswers[q.id] === q.correctIndex) qScore = q.marks || 1;
      } else if (q.type === "msq") {
        const selected = selectedAnswers[q.id] || [];
        const correct = q.correctIndices || [];
        if (selected.length === correct.length && correct.every((c: number) => selected.includes(c))) {
          qScore = q.marks || 1;
        }
      } else if (q.type === "code") {
        if (codeScores[q.id]) qScore = q.marks || 1;
      } else if (q.type === "text" || q.type === "short_text" || q.type === "long_text") {
        // Text requires manual grading, default 0 for now
        qScore = 0;
      }
      
      scores[q.id] = qScore;
      totalScoreObtained += qScore;
    });

    const elapsedSeconds = (parseInt(activeTest.duration) || 60) * 60 - timeLeft;

    const submissionData = {
      testId: activeTest.id,
      testTitle: activeTest.title,
      userId: user.uid,
      userEmail: user.email,
      submittedAt: serverTimestamp(),
      status: "pending_review", // Admin needs to review text answers or finalize
      answers: selectedAnswers,
      codeDetails,
      scores,
      totalScore: totalScoreObtained,
      maxScore: maxPossibleScore,
      timeSpentSeconds: elapsedSeconds,
      tabSwitchWarnings
    };

    try {
      await addDoc(collection(db, "mockTestSubmissions"), submissionData);
      
      const minutesSpent = Math.floor(elapsedSeconds / 60);
      const secondsSpent = elapsedSeconds % 60;
      setTestResult({
        score: totalScoreObtained,
        maxScore: maxPossibleScore,
        percentage: maxPossibleScore > 0 ? (totalScoreObtained / maxPossibleScore) * 100 : 0,
        timeSpent: `${minutesSpent}m ${secondsSpent}s`,
        status: "pending_review"
      });
    } catch (e) {
      console.error(e);
      alert("Failed to submit test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!activeTest) return <div className="p-8 text-center">Test not found</div>;

  const questions = activeTest.questions || [];
  const currentQ = questions[currentQuestionIndex];

  // If the test has no questions at all, show a friendly message
  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-muted/20 min-h-screen relative overflow-hidden py-12">
          <div className="container max-w-3xl mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/80 backdrop-blur-md p-10 rounded-3xl border border-border/60 shadow-xl text-center space-y-6"
            >
              <div className="mx-auto w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-extrabold">No Questions Available</h2>
              <p className="text-muted-foreground text-lg">
                This test doesn&apos;t have any questions yet. The admin hasn&apos;t added questions to <strong className="text-foreground">{activeTest.title}</strong>.
              </p>
              <div className="pt-4">
                <Button asChild className="rounded-xl">
                  <Link href="/mock-tests">Return to Tests</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ userSelect: activeTest?.allowCopyPaste === false ? "none" : "auto" }}>
      <Navbar />

      <main className="flex-1 bg-muted/20 min-h-screen relative overflow-hidden py-12">
        <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <AnimatePresence mode="wait">
            {/* SCREEN: Test Simulator */}
            {isTestRunning && activeTest && !testResult && currentQ && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card/80 backdrop-blur-md p-6 rounded-2xl border border-border/60 shadow-lg gap-4">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-primary">
                      Assessment in Progress
                    </span>
                    <h2 className="text-2xl font-bold">{activeTest.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-xl text-lg font-black tracking-wider">
                    <Timer className="w-5 h-5 animate-pulse" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Main panel */}
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Left Column: Question Navigator */}
                  <div className="md:col-span-1 bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-border/50 shadow-md">
                    <h4 className="font-bold text-sm mb-4 text-muted-foreground uppercase tracking-widest">
                      Questions
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((q: any, idx: number) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentQuestionIndex(idx);
                            setConsoleOutput("");
                            setConsoleError("");
                          }}
                          className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                            currentQuestionIndex === idx
                              ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                              : selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== ""
                              ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/35"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Question Content */}
                  <div className="md:col-span-3 bg-card/60 backdrop-blur-md p-8 rounded-2xl border border-border/50 shadow-md flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm font-semibold text-primary">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>
                      <Badge variant="outline" className="border-border">
                        {(currentQ.type || "unknown").toUpperCase()} • {currentQ.marks || 1} Marks
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold leading-relaxed text-foreground mb-8 whitespace-pre-wrap">
                      {currentQ.questionText || "No question text provided."}
                    </h3>

                    {/* Question Input Areas */}
                    <div className="flex-1 mb-8">
                      {currentQ.type === "mcq" && currentQ.options && (
                        <div className="space-y-3">
                          {currentQ.options.map((option: string, idx: number) => {
                            const isSelected = selectedAnswers[currentQ.id] === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectOption(currentQ.id, idx)}
                                className={`w-full text-left p-4 rounded-xl text-sm font-medium border transition-all flex items-center gap-3 ${
                                  isSelected
                                    ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary"
                                    : "bg-background/40 hover:bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${isSelected ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30"}`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {currentQ.type === "msq" && currentQ.options && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground mb-4">Select all that apply.</p>
                          {currentQ.options.map((option: string, idx: number) => {
                            const selectedArr = selectedAnswers[currentQ.id] || [];
                            const isSelected = selectedArr.includes(idx);
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  const newArr = isSelected 
                                    ? selectedArr.filter((i: number) => i !== idx)
                                    : [...selectedArr, idx];
                                  handleSelectOption(currentQ.id, newArr);
                                }}
                                className={`w-full text-left p-4 rounded-xl text-sm font-medium border transition-all flex items-center gap-3 ${
                                  isSelected
                                    ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary"
                                    : "bg-background/40 hover:bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${isSelected ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30"}`}>
                                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                </div>
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {(currentQ.type === "text" || currentQ.type === "long_text") && (
                        <div className="h-full">
                          <Textarea 
                            placeholder="Write your detailed answer here..." 
                            className="min-h-[250px] resize-y bg-background"
                            value={selectedAnswers[currentQ.id] || ""}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleSelectOption(currentQ.id, e.target.value)}
                          />
                        </div>
                      )}

                      {currentQ.type === "short_text" && (
                        <div className="h-full">
                          <Input 
                            placeholder="Write your short answer here..." 
                            className="bg-background h-14 text-lg"
                            value={selectedAnswers[currentQ.id] || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectOption(currentQ.id, e.target.value)}
                          />
                        </div>
                      )}

                      {currentQ.type === "code" && (
                        <div className="space-y-4">
                          <div className="h-[400px]">
                            <CodeEditor 
                              testCases={currentQ.testCases || []} 
                              onRun={handleCodeRun} 
                              onSubmit={(code, lang, passed, testResults) => handleCodeSubmit(currentQ.id, code, lang, passed, testResults)}
                              allowCopyPaste={activeTest?.allowCopyPaste ?? true}
                            />
                          </div>
                          {(consoleOutput || consoleError) && (
                            <div className="bg-black p-4 rounded-lg font-mono text-sm max-h-[150px] overflow-auto">
                                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                    <Terminal className="w-4 h-4" /> Console Output
                                </div>
                                {consoleOutput && <div className="text-emerald-400 whitespace-pre-wrap">{consoleOutput}</div>}
                                {consoleError && <div className="text-red-400 whitespace-pre-wrap">{consoleError}</div>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nav Actions */}
                    <div className="flex justify-between items-center mt-auto pt-6 border-t border-border/40">
                      <Button
                        variant="outline"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => {
                          setCurrentQuestionIndex((prev) => prev - 1);
                          setConsoleOutput(""); setConsoleError("");
                        }}
                        className="rounded-xl"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      {currentQuestionIndex < (questions.length || 1) - 1 ? (
                        <Button
                          onClick={() => {
                            setCurrentQuestionIndex((prev) => prev + 1);
                            setConsoleOutput(""); setConsoleError("");
                          }}
                          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmitTest}
                          disabled={isSubmitting}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Test"}
                          {!isSubmitting && <CheckCircle2 className="w-4 h-4 ml-2" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN: Submit Result Info */}
            {testResult && activeTest && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-3xl mx-auto mt-10"
              >
                <div className="bg-card/80 backdrop-blur-md p-10 rounded-3xl border border-border/60 shadow-xl text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-extrabold">Test Submitted Successfully!</h2>
                  <p className="text-muted-foreground text-lg">
                    Your answers have been recorded for <strong className="text-foreground">{activeTest.title}</strong>.
                  </p>
                  
                  <div className="bg-muted/30 p-6 rounded-xl border inline-block text-left w-full max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="text-yellow-600 bg-yellow-600/10 border-yellow-600/20">Pending Review</Badge>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Time Taken:</span>
                        <span className="font-bold">{testResult.timeSpent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Auto-graded Score:</span>
                        <span className="font-bold">{testResult.score} / {testResult.maxScore}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    Your final score might change if there are text-based or coding answers that require manual review by an admin. You will receive an email report once published!
                  </p>

                  <div className="pt-4">
                    <Button asChild className="rounded-xl">
                      <Link href="/mock-tests">Return to Tests</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
