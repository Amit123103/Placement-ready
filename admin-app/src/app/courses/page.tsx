"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, AlertCircle, ExternalLink, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  rating: number;
  link: string;
  details?: string;
  downloadLink?: string;
}

export default function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Course | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({ 
    title: "", instructor: "", duration: "", level: "Beginner", rating: 5.0, link: "",
    details: "", downloadLink: ""
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "courses"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setCourses(data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError("Failed to connect to Firebase database.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ title: "", instructor: "", duration: "", level: "Beginner", rating: 5.0, link: "", details: "", downloadLink: "" });
    setFile(null);
    setUploadProgress(0);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (t: Course) => {
    setEditingItem(t);
    setFormData({ 
      title: t.title, 
      instructor: t.instructor, 
      duration: t.duration, 
      level: t.level,
      rating: t.rating,
      link: t.link,
      details: t.details || "",
      downloadLink: t.downloadLink || ""
    });
    setFile(null);
    setUploadProgress(0);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteDoc(doc(db, "courses", id));
        setCourses(courses.filter(t => t.id !== id));
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
        const storageRef = ref(storage, `courses/${Date.now()}_${file.name}`);
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

      const courseData = { ...formData, downloadLink: finalDownloadLink };

      if (editingItem) {
        await updateDoc(doc(db, "courses", editingItem.id), courseData);
        setCourses(courses.map(t => t.id === editingItem.id ? { ...courseData, id: editingItem.id } as Course : t));
      } else {
        const newData = { ...courseData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "courses"), newData);
        setCourses([...courses, { ...newData, id: docRef.id } as Course]);

        try {
          const settingsSnap = await getDoc(doc(db, "settings", "notifications"));
          const settings = settingsSnap.exists() ? settingsSnap.data() : null;
          
          if (!settings || settings.courses !== false) {
            const motivationText = "Continuous learning is the secret to staying ahead. Enroll in this new course to build your expertise and stand out!";
            const shortDescription = courseData.description.length > 150 ? courseData.description.substring(0, 150) + "..." : courseData.description;

            fetch('/api/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subject: 'New Course Added!',
                message: `A new course "<strong>${courseData.title}</strong>" by ${courseData.instructor} has been added.<br/><br/>
                <strong>Brief Introduction:</strong><br/>
                ${shortDescription}<br/><br/>
                <strong>Motivation:</strong><br/>
                ${motivationText}<br/><br/>
                Log in to start learning now!`
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
      alert("Failed to save. Please check your Firebase connection and storage rules.");
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Manage Courses</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Add Course</Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Course Title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input id="instructor" required value={formData.instructor} onChange={e => setFormData({ ...formData, instructor: e.target.value })} placeholder="Instructor Name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 10 hours" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input id="rating" type="number" step="0.1" max="5" required value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} placeholder="5.0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input id="level" required value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} placeholder="Beginner, Intermediate, Advanced" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Course Main URL (e.g. Video Link)</Label>
              <Input id="link" required value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Course Notes / Details</Label>
              <Textarea 
                id="details" 
                rows={3}
                value={formData.details} 
                onChange={e => setFormData({ ...formData, details: e.target.value })} 
                placeholder="Write additional course notes here..." 
              />
            </div>

            <div className="space-y-2">
              <Label>Upload PDF/Docs for Course</Label>
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
              <p className="text-xs text-muted-foreground mt-1">Or provide a direct URL to notes/docs below</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="downloadLink">External Notes/Docs URL</Label>
              <Input id="downloadLink" value={formData.downloadLink} onChange={e => setFormData({ ...formData, downloadLink: e.target.value })} placeholder="https://..." disabled={!!file} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : editingItem ? "Save Changes" : "Add Course"}
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
              <TableHead>Instructor</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Resources</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading from Firebase...</TableCell>
               </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No courses found. Click "Add Course" to create one.
                </TableCell>
              </TableRow>
            ) : courses.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>{t.instructor}</TableCell>
                <TableCell>{t.duration}</TableCell>
                <TableCell>{t.rating}</TableCell>
                <TableCell>
                  {t.downloadLink ? (
                    <a href={t.downloadLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm font-medium">
                      <ExternalLink className="w-3 h-3" /> Docs
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">None</span>
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
