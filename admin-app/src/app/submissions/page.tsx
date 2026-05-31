"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Code, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Submission {
  id: string;
  questionId: string;
  questionTitle: string;
  userId: string;
  code: string;
  language: string;
  status: string;
  timestamp: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<{ code: string; language: string; title: string } | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const q = query(collection(db, "submissions"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const data: any[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setSubmissions(data);
      } catch (e) {
        console.error("Error fetching submissions:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Student Submissions</h2>
      </div>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading submissions...</TableCell>
               </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.userId}</TableCell>
                <TableCell>{sub.questionTitle}</TableCell>
                <TableCell><Badge variant="outline" className="font-mono">{sub.language}</Badge></TableCell>
                <TableCell>
                  {sub.status === "Passed" ? (
                    <Badge className="bg-green-600 text-white hover:bg-green-600 flex items-center w-fit gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center w-fit gap-1">
                      <XCircle className="w-3 h-3" /> Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(sub.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCode({ code: sub.code, language: sub.language, title: sub.questionTitle })}>
                    <Code className="h-4 w-4 mr-2" /> View Code
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCode} onOpenChange={(open) => !open && setSelectedCode(null)}>
        <DialogContent className="sm:max-w-[700px] bg-[#1e1e1e] text-[#d4d4d4] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-200">{selectedCode?.title} - {selectedCode?.language}</DialogTitle>
          </DialogHeader>
          <div className="bg-black/50 p-4 rounded-md overflow-x-auto max-h-[60vh] overflow-y-auto mt-4">
            <pre className="font-mono text-sm">
              <code>{selectedCode?.code}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
