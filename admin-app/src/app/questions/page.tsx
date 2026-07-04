"use client";

import { useState, useEffect } from "react";
// Firebase imports
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";



interface Question {
  id: string; // Changed to string for Firestore IDs
  title: string;
  difficulty: string;
  category: string;
  description: string;
  solution?: string;
  testCases?: { input: string; output: string }[];
  allowCopyPaste?: boolean;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    difficulty: string;
    category: string;
    description: string;
    solution: string;
    testCases: { input: string; output: string }[];
    allowCopyPaste: boolean;
  }>({ title: "", difficulty: "Easy", category: "Arrays", description: "", solution: "", testCases: [], allowCopyPaste: false });

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
    } catch (err: any) {
      console.error("Error fetching questions:", err);
      setError("Failed to connect to Firebase database. Have you configured your .env.local keys?");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({ title: "", difficulty: "Easy", category: "Arrays", description: "", solution: "", testCases: [], allowCopyPaste: false });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormData({ 
      title: q.title, 
      difficulty: q.difficulty, 
      category: q.category, 
      description: q.description, 
      solution: q.solution || "",
      testCases: q.testCases || [],
      allowCopyPaste: q.allowCopyPaste || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteDoc(doc(db, "questions", id));
        setQuestions(questions.filter(q => q.id !== id));
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Failed to delete. Please check your Firebase connection.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        // Edit
        await updateDoc(doc(db, "questions", editingQuestion.id), formData);
        setQuestions(questions.map((q: any) => q.id === editingQuestion.id ? { ...formData, id: editingQuestion.id } : q));
      } else {
        // Add
        const newData = { ...formData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "questions"), newData);
        setQuestions([...questions, { ...newData, id: docRef.id }]);
        
        try {
          const settingsSnap = await getDoc(doc(db, "settings", "notifications"));
          const settings = settingsSnap.exists() ? settingsSnap.data() : null;
          
          if (!settings || settings.questions !== false) {
            const motivationText = "Sharpening your skills daily is the key to landing your dream job. Don't let this opportunity slip by! Practice makes perfect.";
            const shortDescription = formData.description.length > 150 ? formData.description.substring(0, 150) + "..." : formData.description;
            
            fetch('/api/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subject: 'New DSA Question Added!',
                message: `A new ${formData.difficulty} question "<strong>${formData.title}</strong>" has been added to the ${formData.category} category.<br/><br/>
                <strong>Brief Introduction:</strong><br/>
                ${shortDescription}<br/><br/>
                <strong>Motivation:</strong><br/>
                ${motivationText}<br/><br/>
                Log in to practice it now!`
              })
            }).catch(console.error);
          }
        } catch (e) {
          console.error("Error checking settings for broadcast", e);
        }
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
        <h2 className="text-3xl font-bold tracking-tight">Questions Management</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Add Question</Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                required 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="e.g. Two Sum" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  list="categories"
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Arrays"
                />
                <datalist id="categories">
                  <option value="Arrays" />
                  <option value="Strings" />
                  <option value="Linked List" />
                  <option value="Trees" />
                  <option value="Dynamic Programming" />
                </datalist>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Input
                  id="difficulty"
                  list="difficulties"
                  required
                  value={formData.difficulty}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                  placeholder="e.g. Easy"
                />
                <datalist id="difficulties">
                  <option value="Easy" />
                  <option value="Medium" />
                  <option value="Hard" />
                </datalist>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="allow-copy-paste" 
                checked={formData.allowCopyPaste}
                onCheckedChange={(checked) => setFormData({ ...formData, allowCopyPaste: checked })}
              />
              <Label htmlFor="allow-copy-paste" className="cursor-pointer">Allow Copy & Paste for Students</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                rows={4} 
                required 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Enter the full problem statement here..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution (Optional)</Label>
              <Textarea 
                id="solution" 
                rows={4} 
                value={formData.solution} 
                onChange={e => setFormData({ ...formData, solution: e.target.value })} 
                placeholder="Enter the solution, approach, or explanation here..."
              />
            </div>

            <div className="space-y-4 pt-2">
              <Label className="text-base font-semibold">Test Cases</Label>
              <div className="space-y-3">
                {formData.testCases.map((tc, idx) => (
                  <div key={idx} className="flex gap-2 items-start border p-3 rounded-md bg-muted/20 relative">
                    <div className="flex-1 space-y-2">
                      <Input 
                        placeholder="Input (e.g. 1 2 3)" 
                        value={tc.input} 
                        onChange={e => {
                          const newTc = [...formData.testCases];
                          newTc[idx].input = e.target.value;
                          setFormData({...formData, testCases: newTc});
                        }} 
                      />
                      <Textarea 
                        placeholder="Expected Output" 
                        rows={2}
                        value={tc.output} 
                        onChange={e => {
                          const newTc = [...formData.testCases];
                          newTc[idx].output = e.target.value;
                          setFormData({...formData, testCases: newTc});
                        }} 
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive mt-1" onClick={() => {
                      const newTc = [...formData.testCases];
                      newTc.splice(idx, 1);
                      setFormData({...formData, testCases: newTc});
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormData({...formData, testCases: [...formData.testCases, {input: "", output: ""}]})}>
                <Plus className="w-4 h-4 mr-2" /> Add Test Case
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingQuestion ? "Save Changes" : "Create Question"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading questions from Firebase...</TableCell>
               </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No questions found in database. Click "Add Question" to create one.
                </TableCell>
              </TableRow>
            ) : questions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.title}</TableCell>
                <TableCell><Badge variant="outline">{q.category}</Badge></TableCell>
                <TableCell>
                  <Badge variant={q.difficulty === "Easy" ? "secondary" : q.difficulty === "Medium" ? "default" : "destructive"}>
                    {q.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(q)}>
                    <Edit2 className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(q.id)}>
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
