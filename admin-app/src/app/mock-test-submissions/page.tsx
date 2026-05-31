"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

export default function MockTestSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const q = query(collection(db, "mockTestSubmissions"), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        const data: any[] = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
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
        <h2 className="text-3xl font-bold tracking-tight">Mock Test Submissions</h2>
      </div>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Student Email</TableHead>
              <TableHead>Test Title</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  No mock test submissions found.
                </TableCell>
              </TableRow>
            ) : submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.userEmail}</TableCell>
                <TableCell>{sub.testTitle}</TableCell>
                <TableCell>{sub.totalScore} / {sub.maxScore}</TableCell>
                <TableCell>
                  <Badge variant={sub.status === "published" ? "default" : "secondary"}>
                    {sub.status === "published" ? "Published" : "Pending Review"}
                  </Badge>
                </TableCell>
                <TableCell>{sub.submittedAt ? new Date(sub.submittedAt.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/mock-test-submissions/${sub.id}`}>
                      <Eye className="w-4 h-4 mr-2" /> Review
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
