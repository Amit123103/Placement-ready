"use client";

import { useState, useEffect, use } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CodeEditor } from "@/components/code-editor";

export default function MockTestReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [submission, setSubmission] = useState<any>(null);
  const [testDetails, setTestDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Local state for editing scores manually
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const subRef = doc(db, "mockTestSubmissions", resolvedParams.id);
        const subSnap = await getDoc(subRef);
        if (subSnap.exists()) {
          const subData = subSnap.data();
          setSubmission({ id: subSnap.id, ...subData });
          setEditedScores(subData.scores || {});
          
          const testRef = doc(db, "mockTests", subData.testId);
          const testSnap = await getDoc(testRef);
          if (testSnap.exists()) {
            setTestDetails({ id: testSnap.id, ...testSnap.data() });
          }
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.id]);

  const handleScoreChange = (qId: string, val: string) => {
    const num = parseInt(val) || 0;
    setEditedScores(prev => ({ ...prev, [qId]: num }));
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish these marks? This will send an email to the student.")) return;
    
    setIsPublishing(true);
    try {
      // Calculate new total
      let newTotal = 0;
      Object.values(editedScores).forEach(score => newTotal += score);

      // Save to Firebase
      await updateDoc(doc(db, "mockTestSubmissions", resolvedParams.id), {
        scores: editedScores,
        totalScore: newTotal,
        status: "published"
      });

      // Send Email via our new API
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: submission.userEmail,
          testTitle: submission.testTitle,
          totalScore: newTotal,
          maxScore: submission.maxScore,
          timeSpent: submission.timeSpentSeconds
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setSubmission(prev => ({ ...prev, scores: editedScores, totalScore: newTotal, status: "published" }));
      alert("Report published and email sent successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to publish report. Please check server logs.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (!submission || !testDetails) return <DashboardLayout><p>Submission not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/mock-test-submissions"><ChevronLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review Submission</h2>
          <p className="text-muted-foreground mt-1">
            {submission.testTitle} • {submission.userEmail}
          </p>
        </div>
        <div className="ml-auto">
          {submission.status === "published" ? (
            <Badge variant="default" className="text-sm px-4 py-1.5"><CheckCircle2 className="w-4 h-4 mr-2"/> Published</Badge>
          ) : (
            <Button onClick={handlePublish} disabled={isPublishing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Send className="w-4 h-4 mr-2" />
              {isPublishing ? "Publishing..." : "Publish & Email Report"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground block">Student Email</span>
                <span className="font-medium">{submission.userEmail}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block">Time Spent</span>
                <span className="font-medium">{Math.floor(submission.timeSpentSeconds / 60)}m {submission.timeSpentSeconds % 60}s</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block">Total Score</span>
                <span className="text-3xl font-bold text-primary">
                  {Object.values(editedScores).reduce((a,b) => a+b, 0)} / {submission.maxScore}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Questions Review */}
        <div className="md:col-span-3 space-y-6">
          {testDetails.questions?.map((q: any, idx: number) => {
            const studentAns = submission.answers?.[q.id];
            const currentScore = editedScores[q.id] || 0;
            const maxMarks = q.marks || 1;
            
            return (
              <Card key={q.id}>
                <div className="p-5 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">Q{idx + 1}.</span>
                    <Badge variant="outline">{q.type.toUpperCase()}</Badge>
                    {q.type === "text" && <Badge className="bg-yellow-500/10 text-yellow-600">Needs Manual Review</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Marks Given:</span>
                    <Input 
                      type="number" 
                      value={currentScore} 
                      onChange={(e) => handleScoreChange(q.id, e.target.value)}
                      className="w-20 text-center font-bold text-primary"
                      min={0}
                      max={maxMarks}
                    />
                    <span className="text-muted-foreground text-sm">/ {maxMarks}</span>
                  </div>
                </div>
                
                <CardContent className="pt-6 space-y-6">
                  <p className="font-medium whitespace-pre-wrap">{q.questionText}</p>
                  
                  {q.type === "mcq" && (
                    <div className="space-y-2">
                      {q.options.map((opt: string, oIdx: number) => {
                        const isStudentSel = studentAns === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        
                        let classes = "p-3 rounded border text-sm flex gap-2 items-center ";
                        if (isCorrect) classes += "bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold";
                        else if (isStudentSel && !isCorrect) classes += "bg-destructive/10 border-destructive text-destructive font-bold";
                        else classes += "bg-muted/30 border-border text-muted-foreground";

                        return (
                          <div key={oIdx} className={classes}>
                            <span className="w-5 h-5 rounded-full border flex justify-center items-center text-[10px] bg-background">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            {opt}
                            {isStudentSel && <span className="ml-auto text-xs">(Student's Answer)</span>}
                            {isCorrect && <span className="ml-auto text-xs"><CheckCircle2 className="w-4 h-4"/></span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {q.type === "text" && (
                    <div className="p-4 bg-muted/40 rounded-xl border whitespace-pre-wrap">
                      <span className="text-sm font-bold text-muted-foreground block mb-2">Student's Answer:</span>
                      {studentAns || <span className="italic text-muted-foreground">No answer provided.</span>}
                    </div>
                  )}

                  {q.type === "code" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/40 rounded-xl border">
                        <span className="text-sm font-bold text-muted-foreground block mb-2">Submitted Code:</span>
                        <pre className="font-mono text-sm bg-black/90 p-4 rounded text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                          {studentAns || "// No code submitted"}
                        </pre>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-sm font-bold text-muted-foreground block">Expected Test Cases:</span>
                        {q.testCases?.map((tc: any, i: number) => (
                           <div key={i} className="text-xs font-mono bg-muted p-2 rounded-md flex justify-between gap-4">
                             <div className="flex-1 overflow-hidden text-ellipsis"><strong>In:</strong> {tc.input}</div>
                             <div className="flex-1 overflow-hidden text-ellipsis text-emerald-500"><strong>Out:</strong> {tc.output}</div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
