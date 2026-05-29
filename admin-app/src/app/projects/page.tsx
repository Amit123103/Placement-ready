"use client";

import { useState, useEffect } from "react";
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

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubLink: string;
  liveLink: string;
  difficulty: string;
}

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);

  const [formData, setFormData] = useState({ 
    title: "", description: "", techStack: "", githubLink: "", liveLink: "", difficulty: "Beginner" 
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "projects"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setProjects(data);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError("Failed to connect to Firebase database.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ title: "", description: "", techStack: "", githubLink: "", liveLink: "", difficulty: "Beginner" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (t: Project) => {
    setEditingItem(t);
    setFormData({ 
      title: t.title, 
      description: t.description, 
      techStack: t.techStack ? t.techStack.join(", ") : "", 
      githubLink: t.githubLink, 
      liveLink: t.liveLink || "", 
      difficulty: t.difficulty 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        setProjects(projects.filter(t => t.id !== id));
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Failed to delete. Please check your Firebase connection.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        techStack: formData.techStack.split(",").map(s => s.trim()).filter(Boolean)
      };

      if (editingItem) {
        await updateDoc(doc(db, "projects", editingItem.id), submitData);
        setProjects(projects.map(t => t.id === editingItem.id ? { ...submitData, id: editingItem.id } : t));
      } else {
        const docRef = await addDoc(collection(db, "projects"), submitData);
        setProjects([...projects, { ...submitData, id: docRef.id }]);
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
        <h2 className="text-3xl font-bold tracking-tight">Manage Projects</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
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
            <DialogTitle>{editingItem ? "Edit Project" : "Add New Project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Project Title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
              <Input id="techStack" required value={formData.techStack} onChange={e => setFormData({ ...formData, techStack: e.target.value })} placeholder="React, Node.js, MongoDB" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Input id="difficulty" required value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} placeholder="Beginner, Intermediate, Advanced" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubLink">GitHub URL</Label>
              <Input id="githubLink" required value={formData.githubLink} onChange={e => setFormData({ ...formData, githubLink: e.target.value })} placeholder="https://github.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveLink">Live Demo URL (optional)</Label>
              <Input id="liveLink" value={formData.liveLink} onChange={e => setFormData({ ...formData, liveLink: e.target.value })} placeholder="https://..." />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingItem ? "Save Changes" : "Add Project"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Tech Stack</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading from Firebase...</TableCell>
               </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No projects found. Click "Add Project" to create one.
                </TableCell>
              </TableRow>
            ) : projects.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{t.difficulty}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {t.techStack?.map(tech => (
                       <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
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
