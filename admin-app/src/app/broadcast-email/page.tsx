"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function BroadcastEmailPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    
    try {
      let imageUrl = "";

      // Upload image if selected
      if (file) {
        const storageRef = ref(storage, `broadcasts/${Date.now()}_${file.name}`);
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
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(true);
            }
          );
        });
      }

      // Send the broadcast
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message: message.replace(/\n/g, '<br/>'), // Convert newlines to HTML breaks
          imageUrl
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: data.message || "Broadcast email sent successfully to all users!" });
        setSubject("");
        setMessage("");
        setFile(null);
        setUploadProgress(0);
      } else {
        throw new Error(data.error || "Failed to send broadcast");
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", message: err.message || "An error occurred while sending." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Broadcast Email</h2>
          <p className="text-muted-foreground mt-1">Send an announcement email to all registered users.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>Fill out the details below to blast an email to everyone.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-6">
              
              {status.message && (
                <div className={`p-4 rounded-md flex items-center gap-3 ${status.type === "success" ? "bg-green-500/15 text-green-600 border border-green-500/20" : "bg-destructive/15 text-destructive border border-destructive/20"}`}>
                  {status.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5" />}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="e.g. Huge Update: New Placements Added!" 
                  required 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message Body</Label>
                <Textarea 
                  id="message" 
                  placeholder="Write your email content here. You can write multiple paragraphs..." 
                  rows={8}
                  required 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Attach an Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {file && <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                </div>
                {loading && file && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">This image will be displayed inside the email.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send Broadcast to All Users</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
