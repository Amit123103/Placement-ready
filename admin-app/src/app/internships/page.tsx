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

interface Internship {
  id: string;
  role: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  applyLink: string;
  type: string;
}

export default function InternshipsAdmin() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Internship | null>(null);

  const [formData, setFormData] = useState({ 
    role: "", company: "", location: "", stipend: "", duration: "", applyLink: "", type: "Remote" 
  });

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "internships"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setInternships(data);
    } catch (err: any) {
      console.error("Error fetching internships:", err);
      setError("Failed to connect to Firebase database.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ role: "", company: "", location: "", stipend: "", duration: "", applyLink: "", type: "Remote" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (t: Internship) => {
    setEditingItem(t);
    setFormData({ role: t.role, company: t.company, location: t.location, stipend: t.stipend, duration: t.duration, applyLink: t.applyLink, type: t.type });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this internship?")) {
      try {
        await deleteDoc(doc(db, "internships", id));
        setInternships(internships.filter(t => t.id !== id));
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Failed to delete. Please check your Firebase connection.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, "internships", editingItem.id), formData);
        setInternships(internships.map(t => t.id === editingItem.id ? { ...formData, id: editingItem.id } : t));
      } else {
        const docRef = await addDoc(collection(db, "internships"), formData);
        setInternships([...internships, { ...formData, id: docRef.id }]);
        
        // Trigger broadcast email
        const motivationText = "Starting your career early is the best investment you can make. Every experience counts towards your dream job!";
        fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: 'New Internship Opportunity Added!',
            message: `A new <strong>${formData.role}</strong> internship at <strong>${formData.company}</strong> has been added.<br/><br/>
            <strong>Brief Introduction:</strong><br/>
            Role: ${formData.role}<br/>
            Location: ${formData.location}<br/>
            Stipend: ${formData.stipend}<br/><br/>
            <strong>Motivation:</strong><br/>
            ${motivationText}<br/><br/>
            Log in and check the Internships section to apply now!`
          })
        }).catch(console.error);
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
        <h2 className="text-3xl font-bold tracking-tight">Manage Internships</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Add Internship</Button>
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
            <DialogTitle>{editingItem ? "Edit Internship" : "Add New Internship"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Software Engineer Intern" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Google" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Remote or Bangalore" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stipend">Stipend</Label>
                <Input id="stipend" required value={formData.stipend} onChange={e => setFormData({ ...formData, stipend: e.target.value })} placeholder="50k/month" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="6 months" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} placeholder="On-site, Remote" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="applyLink">Apply URL</Label>
              <Input id="applyLink" required value={formData.applyLink} onChange={e => setFormData({ ...formData, applyLink: e.target.value })} placeholder="https://..." />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingItem ? "Save Changes" : "Add Internship"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading from Firebase...</TableCell>
               </TableRow>
            ) : internships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No internships found. Click "Add Internship" to create one.
                </TableCell>
              </TableRow>
            ) : internships.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.role}</TableCell>
                <TableCell>{t.company}</TableCell>
                <TableCell>{t.location}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t.type}</Badge>
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
