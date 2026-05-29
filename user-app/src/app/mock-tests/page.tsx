"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Timer, FileText, CheckCircle2, AlertCircle, XCircle, ArrowRight, ArrowLeft, Trophy, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Hardcoded premium mock tests with full question banks for high-fidelity interactive simulation
interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface MockTest {
  id: string;
  title: string;
  category: string;
  duration: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  questionsCount: number;
  questions: Question[];
}

const MOCK_TESTS: MockTest[] = [
  {
    id: "dsa-basic",
    title: "Data Structures Foundations",
    category: "DSA/Coding",
    duration: 10,
    difficulty: "Easy",
    questionsCount: 5,
    questions: [
      {
        id: "q1",
        questionText: "What is the worst-case time complexity of searching an element in a binary search tree (BST)?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        correctIndex: 2,
        explanation: "In the worst case, a binary search tree can become skewed (like a linked list), resulting in a time complexity of O(N)."
      },
      {
        id: "q2",
        questionText: "Which data structure operates on a Last-In-First-Out (LIFO) principle?",
        options: ["Queue", "Stack", "Heap", "Hash Table"],
        correctIndex: 1,
        explanation: "A Stack is a Last-In-First-Out (LIFO) data structure. The last element inserted is the first one to be removed."
      },
      {
        id: "q3",
        questionText: "What is the time complexity to insert an element at the beginning of a singly linked list?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        correctIndex: 0,
        explanation: "Inserting an element at the beginning of a linked list only requires updating the next pointer of the new node to point to the current head, which takes constant time O(1)."
      },
      {
        id: "q4",
        questionText: "Which sorting algorithm has the best average-case performance of O(N log N) and is typically stable?",
        options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Selection Sort"],
        correctIndex: 2,
        explanation: "Merge Sort is a stable sorting algorithm that guarantees O(N log N) time complexity in the worst, average, and best cases."
      },
      {
        id: "q5",
        questionText: "What is the space complexity of an in-place sorting algorithm?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
        correctIndex: 0,
        explanation: "An in-place sorting algorithm uses a constant amount of extra memory space (O(1)) beyond the input array."
      }
    ]
  },
  {
    id: "aptitude-quant",
    title: "Quantitative Aptitude Challenger",
    category: "Aptitude",
    duration: 15,
    difficulty: "Medium",
    questionsCount: 5,
    questions: [
      {
        id: "q1",
        questionText: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
        options: ["120 metres", "150 metres", "180 metres", "324 metres"],
        correctIndex: 1,
        explanation: "Speed = 60 * (5/18) = 50/3 m/sec. Length of train = Speed * Time = (50/3) * 9 = 150 metres."
      },
      {
        id: "q2",
        questionText: "If 12 men or 18 women can do a work in 14 days, in how many days will 8 men and 16 women do the same work?",
        options: ["5 days", "7 days", "9 days", "10 days"],
        correctIndex: 2,
        explanation: "12 men = 18 women => 1 man = 1.5 women. Thus, 8 men + 16 women = 8(1.5) + 16 = 28 women. If 18 women do it in 14 days, then 28 women do it in (18 * 14) / 28 = 9 days."
      },
      {
        id: "q3",
        questionText: "A sum of money at compound interest amounts to thrice itself in 3 years. In how many years will it be 9 times itself?",
        options: ["6 years", "9 years", "12 years", "15 years"],
        correctIndex: 0,
        explanation: "If P becomes 3P in 3 years, then by compounding, it will become 3 * 3P = 9P in 3 + 3 = 6 years."
      },
      {
        id: "q4",
        questionText: "Find the odd one out: 3, 5, 11, 14, 17, 21, 23",
        options: ["14", "17", "21", "23"],
        correctIndex: 0,
        explanation: "14 is the only even number in the series. All other numbers are odd (and mostly prime)."
      },
      {
        id: "q5",
        questionText: "The average age of a class of 30 students is 15 years. If the teacher's age is included, the average increases by 1 year. What is the teacher's age?",
        options: ["40 years", "45 years", "46 years", "50 years"],
        correctIndex: 2,
        explanation: "Sum of students' ages = 30 * 15 = 450. Sum with teacher = 31 * 16 = 496. Teacher's age = 496 - 450 = 46 years."
      }
    ]
  },
  {
    id: "google-mock",
    title: "Google Interview Warmup",
    category: "Company Specific",
    duration: 15,
    difficulty: "Hard",
    questionsCount: 5,
    questions: [
      {
        id: "q1",
        questionText: "Which algorithmic strategy is used to solve the Longest Common Subsequence (LCS) problem optimally?",
        options: ["Greedy Approach", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
        correctIndex: 1,
        explanation: "Dynamic programming is used to solve the LCS problem optimally by storing solutions to subproblems to avoid redundant calculations."
      },
      {
        id: "q2",
        questionText: "Given a graph with negative weight edges, which algorithm should be used to find the shortest path from a single source node?",
        options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm"],
        correctIndex: 1,
        explanation: "Bellman-Ford algorithm handles negative weight edges and detects negative weight cycles. Dijkstra's algorithm fails with negative weights."
      },
      {
        id: "q3",
        questionText: "What does the 'P vs NP' question fundamentally ask?",
        options: ["Whether all polynomial-time solvable problems are NP-complete", "Whether problems whose solutions can be verified quickly can also be solved quickly", "Whether non-deterministic machines can run deterministic code", "Whether parallel computing reduces exponential complexity"],
        correctIndex: 1,
        explanation: "The P vs NP question asks whether every problem whose solution can be verified quickly (NP) can also be solved quickly (P)."
      },
      {
        id: "q4",
        questionText: "In a network routing system, which data structure is best suited for implementing a fast IP-lookup mechanism?",
        options: ["Red-Black Tree", "Trie (Prefix Tree)", "Hash Table", "Skip List"],
        correctIndex: 1,
        explanation: "Tries are ideally suited for prefix matching, which is exactly how IP routing lookup and autocomplete search functions are efficiently performed."
      },
      {
        id: "q5",
        questionText: "What is the amortized time complexity of inserting an element into a dynamic array (like std::vector in C++ or ArrayList in Java)?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        correctIndex: 0,
        explanation: "Although resizing takes O(N) time occasionally, the individual insertions take O(1) on average. Summing up over N insertions, the amortized cost per insertion is O(1)."
      }
    ]
  }
];

export default function MockTestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Navigation Guard: Mock tests are restricted to logged-in users
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/mock-tests");
    }
  }, [user, loading, router]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "DSA/Coding", "Aptitude", "Company Specific"];

  // Active Session State
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    score: number;
    percentage: number;
    timeSpent: string;
    answers: Record<string, number>;
  } | null>(null);

  // Timer countdown hook
  useEffect(() => {
    if (!isTestRunning || timeLeft <= 0) {
      if (isTestRunning && timeLeft <= 0) {
        handleSubmitTest();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestRunning, timeLeft]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleStartTest = (test: MockTest) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(test.duration * 60);
    setIsTestRunning(true);
    setTestResult(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;
    
    setIsTestRunning(false);
    
    // Calculate Score
    let correctCount = 0;
    activeTest.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const elapsedSeconds = activeTest.duration * 60 - timeLeft;
    const minutesSpent = Math.floor(elapsedSeconds / 60);
    const secondsSpent = elapsedSeconds % 60;

    setTestResult({
      score: correctCount,
      percentage: (correctCount / activeTest.questionsCount) * 100,
      timeSpent: `${minutesSpent}m ${secondsSpent}s`,
      answers: selectedAnswers
    });
  };

  const handleReset = () => {
    setActiveTest(null);
    setIsTestRunning(false);
    setTestResult(null);
  };

  // Filter listings
  const filteredTests = MOCK_TESTS.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/20 min-h-screen relative overflow-hidden py-12">
        {/* Decorative Gradients */}
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <AnimatePresence mode="wait">
            {/* SCREEN 1: Test Listings */}
            {!isTestRunning && !testResult && (
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
                    Evaluate your skills in real-time. Practice company-specific tests and standard MCQ formats with full diagnostic reports.
                  </p>
                </div>

                {/* Filter and Search Panel */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-lg">
                  {/* Category Buttons */}
                  <div className="flex gap-2 flex-wrap justify-center">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          activeCategory === cat
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search input */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search mock tests..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Grid List */}
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
                        <Badge
                          variant={
                            test.difficulty === "Easy"
                              ? "secondary"
                              : test.difficulty === "Medium"
                              ? "default"
                              : "destructive"
                          }
                          className="bg-opacity-20 text-opacity-95"
                        >
                          {test.difficulty}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {test.title}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1.5">
                          <Timer className="w-4 h-4 text-muted-foreground" />
                          {test.duration} mins
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {test.questionsCount} Questions
                        </span>
                      </div>

                      <button
                        onClick={() => handleStartTest(test)}
                        className="w-full mt-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 h-11 transition-all group-hover:translate-y-[-2px] shadow-lg shadow-primary/10"
                      >
                        Start Assessment
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </motion.div>
                  ))}

                  {filteredTests.length === 0 && (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border/80">
                      No matching mock assessments found. Try other keywords!
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SCREEN 2: Test Running Simulator */}
            {isTestRunning && activeTest && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto space-y-6"
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
                      {activeTest.questions.map((q, idx) => (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                            currentQuestionIndex === idx
                              ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                              : selectedAnswers[q.id] !== undefined
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
                  <div className="md:col-span-3 bg-card/60 backdrop-blur-md p-8 rounded-2xl border border-border/50 shadow-md flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm font-semibold text-primary">
                        Question {currentQuestionIndex + 1} of {activeTest.questionsCount}
                      </span>
                      <Badge variant="outline" className="border-border">
                        1 Mark
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold leading-relaxed text-foreground mb-8">
                      {activeTest.questions[currentQuestionIndex].questionText}
                    </h3>

                    {/* Options list */}
                    <div className="space-y-3 mb-8">
                      {activeTest.questions[currentQuestionIndex].options.map((option, idx) => {
                        const qId = activeTest.questions[currentQuestionIndex].id;
                        const isSelected = selectedAnswers[qId] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(qId, idx)}
                            className={`w-full text-left p-4 rounded-xl text-sm font-medium border transition-all flex items-center gap-3 ${
                              isSelected
                                ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary"
                                : "bg-background/40 hover:bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-muted-foreground/30"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Nav Actions */}
                    <div className="flex justify-between items-center mt-auto pt-6 border-t border-border/40">
                      <Button
                        variant="outline"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                        className="rounded-xl"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      {currentQuestionIndex < activeTest.questionsCount - 1 ? (
                        <Button
                          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmitTest}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10"
                        >
                          Finish Assessment
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: Diagnostic Result Page */}
            {testResult && activeTest && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Result Card Summary */}
                <div className="bg-card/80 backdrop-blur-md p-8 rounded-3xl border border-border/60 shadow-xl text-center space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />
                  
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Trophy className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">
                      Assessment Completed
                    </span>
                    <h2 className="text-3xl font-extrabold">{activeTest.title}</h2>
                  </div>

                  {/* Score Matrix */}
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-4 bg-muted/20 rounded-2xl border border-border/30">
                    <div className="text-center">
                      <div className="text-2xl font-black text-primary">
                        {testResult.score} / {activeTest.questionsCount}
                      </div>
                      <span className="text-xs text-muted-foreground">Score Obtained</span>
                    </div>
                    <div className="text-center border-x border-border/40">
                      <div className="text-2xl font-black text-foreground">
                        {testResult.percentage}%
                      </div>
                      <span className="text-xs text-muted-foreground">Accuracy</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-foreground">
                        {testResult.timeSpent}
                      </div>
                      <span className="text-xs text-muted-foreground">Time Elapsed</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button onClick={handleReset} variant="outline" className="rounded-xl">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Back to Assessments
                    </Button>
                    <Button onClick={() => handleStartTest(activeTest)} className="rounded-xl">
                      Retake Test
                    </Button>
                  </div>
                </div>

                {/* Diagnostic Question Review */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold px-1">Detailed Performance Review</h3>
                  
                  {activeTest.questions.map((q, idx) => {
                    const selectedIdx = testResult.answers[q.id];
                    const isCorrect = selectedIdx === q.correctIndex;
                    
                    return (
                      <div
                        key={q.id}
                        className={`p-6 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-md transition-all ${
                          isCorrect ? "border-emerald-500/20" : "border-destructive/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <span className="font-bold text-base">
                            Q{idx + 1}. {q.questionText}
                          </span>
                          {isCorrect ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 flex gap-1 items-center shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                            </Badge>
                          ) : (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/25 flex gap-1 items-center shrink-0">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </Badge>
                          )}
                        </div>

                        {/* Options mapping with highlight */}
                        <div className="space-y-2.5 mb-5">
                          {q.options.map((option, oIdx) => {
                            const isUserSelected = selectedIdx === oIdx;
                            const isCorrectAns = q.correctIndex === oIdx;
                            
                            let optionClass = "bg-background/25 border-border/40 text-muted-foreground";
                            if (isCorrectAns) {
                              optionClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold ring-1 ring-emerald-500/20";
                            } else if (isUserSelected) {
                              optionClass = "bg-destructive/10 border-destructive/30 text-destructive font-semibold ring-1 ring-destructive/20";
                            }

                            return (
                              <div
                                key={oIdx}
                                className={`p-3 rounded-xl border text-sm flex items-center gap-3 ${optionClass}`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                                  isCorrectAns ? "bg-emerald-500 text-white border-emerald-500" :
                                  isUserSelected ? "bg-destructive text-white border-destructive" : "border-muted-foreground/35"
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{option}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Diagnostic Explanation */}
                        <div className="p-4 rounded-xl bg-muted/40 border border-border/40 text-sm leading-relaxed text-muted-foreground flex gap-3">
                          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-foreground block mb-1">Explanation:</span>
                            {q.explanation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
