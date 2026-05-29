"use client";

import { useState, useEffect } from "react";
// Firebase imports
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



interface UserData {
  id: string; // string for firestore
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const [formData, setFormData] = useState({ name: "", email: "", role: "Student", status: "Active" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "users"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Failed to connect to Firebase database. Have you configured your .env.local keys?");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "Student", status: "Active" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (u: UserData) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, status: u.status });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Failed to delete. Please check your Firebase connection.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const res = await fetch(`http://localhost:3001/api/users/${editingUser.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("Update failed");
        const updatedDoc = await res.json();
        setUsers(users.map((u: any) => u.id === editingUser.id ? updatedDoc : u));
      } else {
        const docRef = await addDoc(collection(db, "users"), formData);
        setUsers([...users, { ...formData, id: docRef.id }]);
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
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <Button onClick={handleOpenAdd} disabled={!!error}><Plus className="mr-2 h-4 w-4" /> Add User</Button>
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
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g. John Doe" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                placeholder="e.g. john@example.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingUser ? "Save Changes" : "Create User"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading from Firebase...</TableCell>
               </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No users found in database. Click "Add User" to create one.
                </TableCell>
              </TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback>{u.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === "Admin" ? "default" : "secondary"}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={u.status === "Active" ? "text-green-500 border-green-500/20" : "text-muted-foreground"}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(u)}>
                    <Edit2 className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u.id)}>
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
