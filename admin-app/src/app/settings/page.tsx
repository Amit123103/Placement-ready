"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationSettings {
  internships: boolean;
  projects: boolean;
  questions: boolean;
  mockTests: boolean;
  articles: boolean;
  courses: boolean;
  notes: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    internships: true,
    projects: true,
    questions: true,
    mockTests: true,
    articles: true,
    courses: true,
    notes: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "settings", "notifications");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSettings(docSnap.data() as NotificationSettings);
      } else {
        // If it doesn't exist, create it with defaults
        await setDoc(docRef, settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ text: "Failed to load settings.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // Clear message when they change something so they know it's not saved yet
    setMessage(null);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const docRef = doc(db, "settings", "notifications");
      await setDoc(docRef, settings);
      setMessage({ text: "Settings saved successfully!", type: "success" });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ text: "Failed to save settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const categories: { key: keyof NotificationSettings; label: string; description: string }[] = [
    { key: "internships", label: "Internships", description: "Send an email to all users when a new Internship is added." },
    { key: "projects", label: "Projects", description: "Send an email to all users when a new Project is added." },
    { key: "questions", label: "DSA Questions", description: "Send an email to all users when a new DSA Question is added." },
    { key: "mockTests", label: "Mock Tests", description: "Send an email to all users when a new Mock Test is added." },
    { key: "articles", label: "Articles", description: "Send an email to all users when a new Article is added." },
    { key: "courses", label: "Courses", description: "Send an email to all users when a new Course is added." },
    { key: "notes", label: "Notes", description: "Send an email to all users when a new Note is added." },
  ];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage application-wide configurations and preferences.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className={message.type === "success" ? "bg-emerald-50 text-emerald-900 border-emerald-200" : ""}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Auto-Email Broadcasting</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Toggle these settings to control whether an automatic email notification is sent to all registered users when you add new content.
        </p>

        <div className="space-y-6">
          {categories.map(({ key, label, description }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/40 border">
              <div className="space-y-1">
                <Label htmlFor={key} className="text-base font-semibold">{label}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <Button onClick={saveSettings} disabled={saving} className="min-w-[150px]">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
