"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { ExternalLink, Code2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubLink: string;
  liveLink?: string;
  difficulty: string;
  createdAt?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "projects"));
      const data: Project[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(data);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      
      // Fallback mock data
      setProjects([
        {
          id: "m1",
          title: "Real-time Chat Application",
          description: "A full-stack chat application with real-time messaging, user authentication, and read receipts using WebSockets.",
          techStack: ["Next.js", "Socket.io", "Tailwind CSS", "MongoDB"],
          githubLink: "#",
          liveLink: "#",
          difficulty: "Advanced"
        },
        {
          id: "m2",
          title: "E-Commerce Dashboard",
          description: "An admin dashboard for managing products, orders, and users with analytical charts and data tables.",
          techStack: ["React", "Redux", "Recharts", "Material UI"],
          githubLink: "#",
          difficulty: "Intermediate"
        },
        {
          id: "m3",
          title: "Personal Portfolio",
          description: "A minimalist and responsive portfolio website to showcase projects and skills, featuring dark mode and animations.",
          techStack: ["HTML", "CSS", "JavaScript", "Framer Motion"],
          githubLink: "#",
          liveLink: "#",
          difficulty: "Beginner"
        }
      ]);

      if (err?.message?.includes("Missing or insufficient permissions") || err?.code === "permission-denied") {
        setError("Firebase permissions are missing. Loading mock data. Please update your Firestore Security Rules.");
      } else {
        setError("Could not connect to Firebase database. Loading mock data for now.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-muted/30 py-12 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-40 right-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Resume-Worthy <span className="text-primary">Projects</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Build these curated projects to strengthen your resume and ace technical interviews.
            </p>
          </motion.div>

          {error && (
            <Alert variant="default" className="mb-8 border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col"
                >
                  <div className="glass-card flex-1 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 shrink-0">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <Badge variant={
                        project.difficulty === 'Beginner' ? 'secondary' :
                        project.difficulty === 'Intermediate' ? 'default' : 'destructive'
                      } className="bg-opacity-20 text-opacity-90">
                        {project.difficulty}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map(tech => (
                          <span key={tech} className="px-2.5 py-1 bg-muted text-xs font-medium rounded-md border border-border/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {project.createdAt && (
                      <p className="text-[11px] text-muted-foreground/70 mb-4 text-center">
                        Added on {new Date(project.createdAt).toLocaleDateString()} at {new Date(project.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-border/50 mt-auto">
                      <Button variant="outline" className="flex-1 group" asChild>
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4 mr-2 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                          </svg>
                          Source
                        </a>
                      </Button>
                      {project.liveLink && (
                        <Button className="flex-1 group" asChild>
                          <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                            Preview
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {projects.length === 0 && !error && (
                <div className="col-span-full py-20 text-center text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border">
                  No projects posted yet. Check back later!
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
