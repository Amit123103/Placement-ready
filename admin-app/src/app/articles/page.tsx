"use client";

import { useState, useEffect } from "react";
// Firebase imports
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, AlertCircle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";



interface Article {
  id: string; // string for firestore
  title: string;
  author: string;
  publishDate: string;
  status: string;
  content: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [formData, setFormData] = useState({ title: "", author: "", status: "Draft", content: "" });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "articles"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setArticles(data);
    } catch (err: any) {
      console.error("Error fetching articles:", err);
      setError("Failed to connect to Firebase database. Have you configured your .env.local keys?");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormData({ title: "", author: "", status: "Draft", content: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (a: Article) => {
    setEditingArticle(a);
    setFormData({ title: a.title, author: a.author, status: a.status, content: a.content });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteDoc(doc(db, "articles", id));
        setArticles(articles.filter(a => a.id !== id));
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Failed to delete. Please check your Firebase connection.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        // Edit
        await updateDoc(doc(db, "articles", editingArticle.id), formData);
        setArticles(articles.map(a => a.id === editingArticle.id ? { ...a, ...formData } : a));
      } else {
        // Add
        const newArticle = { ...formData, publishDate: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "articles"), newArticle);
        setArticles([...articles, { ...newArticle, id: docRef.id }]);

        try {
          const settingsSnap = await getDoc(doc(db, "settings", "notifications"));
          const settings = settingsSnap.exists() ? settingsSnap.data() : null;
          
          if (!settings || settings.articles !== false) {
            const motivationText = "Reading expands your perspective. Check out this new article to gain valuable insights!";
            const shortDescription = newArticle.content.length > 150 ? newArticle.content.substring(0, 150) + "..." : newArticle.content;

            fetch('/api/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subject: 'New Article Published!',
                message: `A new article "<strong>${newArticle.title}</strong>" has been published in the ${newArticle.category} category.<br/><br/>
                <strong>Excerpt:</strong><br/>
                ${shortDescription}<br/><br/>
                <strong>Motivation:</strong><br/>
                ${motivationText}<br/><br/>
                Log in to read the full article now!`
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
        <h2 className="text-3xl font-bold tracking-tight">Articles & Publications</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Create Article</Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Edit Article" : "Create New Article"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input 
                id="title" 
                required 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="e.g. How to Crack Google Interview" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author Name</Label>
                <Input 
                  id="author" 
                  required 
                  value={formData.author} 
                  onChange={e => setFormData({ ...formData, author: e.target.value })} 
                  placeholder="e.g. John Doe" 
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Article Content (Markdown)</Label>
              <Textarea 
                id="content" 
                rows={10} 
                required 
                value={formData.content} 
                onChange={e => setFormData({ ...formData, content: e.target.value })} 
                placeholder="Write your article content here..."
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingArticle ? "Save Changes" : "Publish Article"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading from Firebase...</TableCell>
               </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No articles found in database. Click "Create Article" to add one.
                </TableCell>
              </TableRow>
            ) : articles.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{a.title}</TableCell>
                <TableCell>{a.author}</TableCell>
                <TableCell>{a.publishDate}</TableCell>
                <TableCell>
                  <Badge variant={a.status === "Published" ? "default" : a.status === "Draft" ? "secondary" : "outline"}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(a)}>
                    <Edit2 className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a.id)}>
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
