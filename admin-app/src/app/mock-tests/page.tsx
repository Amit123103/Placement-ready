"use client";

import { useState, useEffect } from "react";
// Firebase imports
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



interface MockTest {
  id: string; // String for firestore
  title: string;
  duration: string;
  questions: number;
  status: string;
}

export default function MockTestsPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);

  const [formData, setFormData] = useState({ title: "", duration: "", questions: 0, status: "Draft" });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "mockTests"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setTests(data);
    } catch (err: any) {
      console.error("Error fetching mock tests:", err);
      setError("Failed to connect to Firebase database. Have you configured your .env.local keys?");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTest(null);
    setFormData({ title: "", duration: "", questions: 0, status: "Draft" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (t: MockTest) => {
    setEditingTest(t);
    setFormData({ title: t.title, duration: t.duration, questions: t.questions, status: t.status });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this mock test?")) {
      try {
        await deleteDoc(doc(db, "mockTests", id));
        setTests(tests.filter(t => t.id !== id));
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Failed to delete. Please check your Firebase connection.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await updateDoc(doc(db, "mockTests", editingTest.id), formData);
        setTests(tests.map((t: any) => t.id === editingTest.id ? { ...formData, id: editingTest.id } : t));
      } else {
        const docRef = await addDoc(collection(db, "mockTests"), formData);
        setTests([...tests, { ...formData, id: docRef.id }]);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save. Please check your Firebase connection.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Mock Tests</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Create Test</Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle>{editingTest ? "Edit Mock Test" : "Create New Test"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Test Title</Label>
              <Input 
                id="title" 
                required 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="e.g. Google Interview Mock" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input 
                id="duration" 
                required 
                value={formData.duration} 
                onChange={e => setFormData({ ...formData, duration: e.target.value })} 
                placeholder="e.g. 120 mins" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questions">Number of Questions</Label>
              <Input 
                id="questions" 
                type="number" 
                required 
                value={formData.questions} 
                onChange={e => setFormData({ ...formData, questions: parseInt(e.target.value) || 0 })} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val || "" })}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTest ? "Save Changes" : "Create Test"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading from Firebase...</TableCell>
               </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No mock tests found in database. Click "Create Test" to add one.
                </TableCell>
              </TableRow>
            ) : tests.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>{t.duration}</TableCell>
                <TableCell>{t.questions}</TableCell>
                <TableCell>
                  <Badge variant={t.status === "Published" ? "default" : t.status === "Draft" ? "secondary" : "outline"}>
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/mock-tests/${t.id}`}>Build Test</a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(t)}>
                    <Edit2 className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4" />
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
