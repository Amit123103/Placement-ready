"use client";

import { useState, useEffect, use } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Plus, Trash2, CheckCircle2, Code, AlignLeft, List } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function MockTestBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [testData, setTestData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Question State
  const [type, setType] = useState<"mcq" | "msq" | "short_text" | "long_text" | "code">("mcq");
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  
  // MCQ/MSQ specific
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [correctIndices, setCorrectIndices] = useState<number[]>([]);
  
  // Code specific
  const [testCases, setTestCases] = useState([{ input: "", output: "" }]);

  useEffect(() => {
    async function fetchTest() {
      try {
        const docRef = doc(db, "mockTests", resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTestData({ id: docSnap.id, ...docSnap.data() });
          setQuestions(docSnap.data().questions || []);
        }
      } catch (e) {
        console.error("Error fetching test:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [resolvedParams.id]);

  const handleAddQuestion = async () => {
    if (!questionText.trim()) return alert("Question text is required.");

    const newQuestion: any = {
      id: "q" + Date.now(),
      type,
      questionText,
      marks
    };

    if (type === "mcq") {
      if (options.some(opt => !opt.trim())) return alert("All options must be filled.");
      newQuestion.options = options;
      newQuestion.correctIndex = correctIndex;
    } else if (type === "msq") {
      if (options.some(opt => !opt.trim())) return alert("All options must be filled.");
      if (correctIndices.length === 0) return alert("Select at least one correct option.");
      newQuestion.options = options;
      newQuestion.correctIndices = correctIndices;
    } else if (type === "code") {
      if (testCases.some(tc => !tc.input.trim() || !tc.output.trim())) return alert("All test cases must be filled.");
      newQuestion.testCases = testCases;
    }

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);

    try {
      await updateDoc(doc(db, "mockTests", resolvedParams.id), { questions: updatedQuestions });
      // Reset form
      setQuestionText("");
      setMarks(1);
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
      setCorrectIndices([]);
      setTestCases([{ input: "", output: "" }]);
    } catch (e) {
      console.error(e);
      alert("Failed to save question.");
    }
  };

  const handleDeleteQuestion = async (idToRemove: string) => {
    const updatedQuestions = questions.filter(q => q.id !== idToRemove);
    setQuestions(updatedQuestions);
    try {
      await updateDoc(doc(db, "mockTests", resolvedParams.id), { questions: updatedQuestions });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <DashboardLayout><p>Loading test builder...</p></DashboardLayout>;
  if (!testData) return <DashboardLayout><p>Test not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/mock-tests"><ChevronLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Test Builder</h2>
          <p className="text-muted-foreground mt-1">{testData.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Add Question Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq"><span className="flex items-center gap-2"><List className="w-4 h-4"/> Single Choice (MCQ)</span></SelectItem>
                    <SelectItem value="msq"><span className="flex items-center gap-2"><List className="w-4 h-4"/> Multiple Selection (MSQ)</span></SelectItem>
                    <SelectItem value="short_text"><span className="flex items-center gap-2"><AlignLeft className="w-4 h-4"/> Short Answer</span></SelectItem>
                    <SelectItem value="long_text"><span className="flex items-center gap-2"><AlignLeft className="w-4 h-4"/> Long Answer</span></SelectItem>
                    <SelectItem value="code"><span className="flex items-center gap-2"><Code className="w-4 h-4"/> Coding</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Question Details</Label>
                <Textarea placeholder="Write the question..." value={questionText} onChange={e => setQuestionText(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input type="number" min={1} value={marks} onChange={e => setMarks(parseInt(e.target.value) || 1)} />
              </div>

              {type === "mcq" && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <Label>Options & Correct Answer</Label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="correctOpt" 
                        checked={correctIndex === i} 
                        onChange={() => setCorrectIndex(i)} 
                        className="w-4 h-4"
                      />
                      <Input 
                        placeholder={`Option ${i+1}`} 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...options];
                          newOpts[i] = e.target.value;
                          setOptions(newOpts);
                        }} 
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Select the radio button next to the correct option.</p>
                </div>
              )}

              {type === "msq" && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <Label>Options & Correct Answers (Select multiple)</Label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={correctIndices.includes(i)} 
                        onChange={(e) => {
                          if (e.target.checked) setCorrectIndices([...correctIndices, i]);
                          else setCorrectIndices(correctIndices.filter(idx => idx !== i));
                        }} 
                        className="w-4 h-4"
                      />
                      <Input 
                        placeholder={`Option ${i+1}`} 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...options];
                          newOpts[i] = e.target.value;
                          setOptions(newOpts);
                        }} 
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Select the checkboxes next to all correct options.</p>
                </div>
              )}

              {type === "code" && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <Label>Test Cases</Label>
                  {testCases.map((tc, i) => (
                    <div key={i} className="space-y-2 p-3 bg-muted/30 rounded-md border">
                      <Input placeholder="Input" value={tc.input} onChange={e => {
                        const newTC = [...testCases];
                        newTC[i].input = e.target.value;
                        setTestCases(newTC);
                      }} />
                      <Input placeholder="Expected Output" value={tc.output} onChange={e => {
                        const newTC = [...testCases];
                        newTC[i].output = e.target.value;
                        setTestCases(newTC);
                      }} />
                      {testCases.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => setTestCases(testCases.filter((_, idx) => idx !== i))} className="text-destructive h-6 p-0 px-2">Remove</Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setTestCases([...testCases, { input: "", output: "" }])} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Test Case
                  </Button>
                </div>
              )}

              <Button onClick={handleAddQuestion} className="w-full mt-4">Add Question to Test</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: List of Questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Current Questions ({questions.length})</h3>
          </div>
          
          {questions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              No questions added yet. Use the panel on the left to add one.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card key={q.id} className="relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 to-primary/10" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-muted-foreground">Q{idx + 1}.</span>
                          <Badge variant="outline">{q.type.toUpperCase()}</Badge>
                          <Badge variant="secondary">{q.marks} Marks</Badge>
                        </div>
                        <p className="text-foreground font-medium mb-4 whitespace-pre-wrap">{q.questionText}</p>
                        
                        {q.type === "mcq" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {q.options.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className={`p-2 rounded border ${q.correctIndex === oIdx ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'bg-muted/30 border-border'}`}>
                                {String.fromCharCode(65 + oIdx)}. {opt} {q.correctIndex === oIdx && <CheckCircle2 className="w-4 h-4 inline ml-1" />}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === "msq" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {q.options.map((opt: string, oIdx: number) => {
                              const isCorrect = q.correctIndices?.includes(oIdx);
                              return (
                                <div key={oIdx} className={`p-2 rounded border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'bg-muted/30 border-border'}`}>
                                  [ {isCorrect ? 'x' : ' '} ] {opt} {isCorrect && <CheckCircle2 className="w-4 h-4 inline ml-1" />}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === "code" && (
                          <div className="space-y-2 mt-2">
                            {q.testCases.map((tc: any, i: number) => (
                              <div key={i} className="text-xs font-mono bg-muted p-2 rounded-md flex justify-between gap-4">
                                <div className="flex-1 overflow-hidden text-ellipsis"><strong>In:</strong> {tc.input}</div>
                                <div className="flex-1 overflow-hidden text-ellipsis text-emerald-500"><strong>Out:</strong> {tc.output}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)} className="text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </DashboardLayout>
  );
}
