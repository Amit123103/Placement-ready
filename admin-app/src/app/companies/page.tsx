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
import { Textarea } from "@/components/ui/textarea";

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  employees: string;
  rating: string;
  description: string;
  applyLink: string;
}

export default function CompaniesAdmin() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    name: "", industry: "", location: "", employees: "", rating: "", description: "", applyLink: ""
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "companies"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setCompanies(data);
    } catch (err: any) {
      console.error("Error fetching companies:", err);
      setError("Failed to connect to Firebase database.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", industry: "", location: "", employees: "", rating: "", description: "", applyLink: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (c: Company) => {
    setEditingItem(c);
    setFormData({
      name: c.name, industry: c.industry, location: c.location,
      employees: c.employees, rating: c.rating, description: c.description, applyLink: c.applyLink
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteDoc(doc(db, "companies", id));
        setCompanies(companies.filter(c => c.id !== id));
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
        await updateDoc(doc(db, "companies", editingItem.id), formData);
        setCompanies(companies.map(c => c.id === editingItem.id ? { ...formData, id: editingItem.id } : c));
      } else {
        const docRef = await addDoc(collection(db, "companies"), formData);
        setCompanies([...companies, { ...formData, id: docRef.id }]);
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
        <h2 className="text-3xl font-bold tracking-tight">Manage Companies</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Add Company</Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Company" : "Add New Company"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Google" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" required value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} placeholder="Technology" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Bangalore, India" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employees">Employees</Label>
                <Input id="employees" required value={formData.employees} onChange={e => setFormData({ ...formData, employees: e.target.value })} placeholder="1,50,000+" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (out of 5)</Label>
                <Input id="rating" required value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} placeholder="4.5" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the company..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applyLink">Careers URL</Label>
              <Input id="applyLink" required value={formData.applyLink} onChange={e => setFormData({ ...formData, applyLink: e.target.value })} placeholder="https://careers.google.com" />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingItem ? "Save Changes" : "Add Company"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading from Firebase...</TableCell>
               </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No companies found. Click &quot;Add Company&quot; to create one.
                </TableCell>
              </TableRow>
            ) : companies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge variant="secondary">{c.industry}</Badge></TableCell>
                <TableCell>{c.location}</TableCell>
                <TableCell>{c.rating} / 5</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(c)}>
                    <Edit2 className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
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
