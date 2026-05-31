"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, AlertCircle, ExternalLink, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Note {
  id: string;
  title: string;
  subject: string;
  description: string;
  downloadLink: string;
}

export default function NotesAdmin() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Note | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({ 
    title: "", subject: "", description: "", downloadLink: "" 
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "notes"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setNotes(data);
    } catch (err: any) {
      console.error("Error fetching notes:", err);
      setError("Failed to connect to Firebase database.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ title: "", subject: "", description: "", downloadLink: "" });
    setFile(null);
    setUploadProgress(0);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (t: Note) => {
    setEditingItem(t);
    setFormData({ 
      title: t.title, 
      subject: t.subject, 
      description: t.description, 
      downloadLink: t.downloadLink 
    });
    setFile(null);
    setUploadProgress(0);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteDoc(doc(db, "notes", id));
        setNotes(notes.filter(t => t.id !== id));
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Failed to delete. Please check your Firebase connection.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalDownloadLink = formData.downloadLink;

      if (file) {
        setUploading(true);
        const storageRef = ref(storage, `notes/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              finalDownloadLink = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(true);
            }
          );
        });
        setUploading(false);
      }

      const noteData = { ...formData, downloadLink: finalDownloadLink };

      if (editingItem) {
        await updateDoc(doc(db, "notes", editingItem.id), noteData);
        setNotes(notes.map(t => t.id === editingItem.id ? { ...noteData, id: editingItem.id } as Note : t));
      } else {
        const docRef = await addDoc(collection(db, "notes"), noteData);
        setNotes([...notes, { ...noteData, id: docRef.id } as Note]);
        
        // Trigger broadcast email
        const motivationText = "Top students are those who consistently prepare. Access these notes now to stay ahead of the curve and boost your placement chances!";
        fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: 'New Study Material Added!',
            message: `A new note <strong>${formData.title}</strong> for the subject <strong>${formData.subject}</strong> has been uploaded.<br/><br/>
            <strong>Brief Introduction:</strong><br/>
            ${formData.description}<br/><br/>
            <strong>Motivation:</strong><br/>
            ${motivationText}<br/><br/>
            Log in to the Notes section to download and read it now!`
          })
        }).catch(console.error);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save. Please check your Firebase connection and storage rules.");
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Manage Notes</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Add Note</Button>
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
            <DialogTitle>{editingItem ? "Edit Note" : "Add New Note"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Operating Systems Notes" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="CS Core" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="space-y-2">
              <Label>File Upload (PDF, DOC, etc.)</Label>
              <Input 
                type="file" 
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                  if (selectedFile) setFormData({ ...formData, downloadLink: "" });
                }}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />
              {uploading && (
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Or provide a direct URL below</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="downloadLink">External Download URL</Label>
              <Input id="downloadLink" value={formData.downloadLink} onChange={e => setFormData({ ...formData, downloadLink: e.target.value })} placeholder="https://..." disabled={!!file} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : editingItem ? "Save Changes" : "Add Note"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading from Firebase...</TableCell>
               </TableRow>
            ) : notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No notes found. Click "Add Note" to create one.
                </TableCell>
              </TableRow>
            ) : notes.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>{t.subject}</TableCell>
                <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                <TableCell>
                  {t.downloadLink ? (
                    <a href={t.downloadLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm font-medium">
                      <ExternalLink className="w-3 h-3" /> View/Download
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">No link</span>
                  )}
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
