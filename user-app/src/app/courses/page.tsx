"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { PlayCircle, Clock, Star, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  rating: number;
  link: string;
  image?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "courses"));
      const data: Course[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Course);
      });
      setCourses(data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      
      // Fallback mock data
      setCourses([
        {
          id: "m1",
          title: "Complete Web Development Bootcamp",
          instructor: "Angela Yu",
          duration: "65 hours",
          level: "Beginner to Advanced",
          rating: 4.8,
          link: "#"
        },
        {
          id: "m2",
          title: "Mastering Data Structures & Algorithms",
          instructor: "Abdul Bari",
          duration: "40 hours",
          level: "Intermediate",
          rating: 4.9,
          link: "#"
        },
        {
          id: "m3",
          title: "System Design for Interviews",
          instructor: "Gaurav Sen",
          duration: "15 hours",
          level: "Advanced",
          rating: 4.7,
          link: "#"
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
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Premium <span className="text-primary">Courses</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Curated video playlists and courses to master your technical skills.
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
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col"
                >
                  <div className="glass-card flex-1 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 shadow-sm">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 min-h-[56px]">{course.title}</h3>
                    
                    <div className="flex items-center text-muted-foreground mb-4 font-medium">
                      <span className="text-foreground/80">{course.instructor}</span>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Duration</span>
                        <span className="font-medium text-foreground">{course.duration}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span className="flex items-center"><Star className="w-4 h-4 mr-2 text-yellow-500" /> Rating</span>
                        <span className="font-medium text-foreground">{course.rating}/5.0</span>
                      </div>
                      <div className="pt-2">
                        <Badge variant="outline" className="bg-background/50">{course.level}</Badge>
                      </div>
                    </div>

                    <Button className="w-full group" asChild>
                      <a href={course.link} target="_blank" rel="noopener noreferrer">
                        Start Learning
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {courses.length === 0 && !error && (
                <div className="col-span-full py-20 text-center text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border">
                  No courses available yet. Check back later!
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
