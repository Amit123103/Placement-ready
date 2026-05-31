"use client";

import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight, Code2, Briefcase, Trophy, LineChart, Users, BookOpen, Building, Star } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { collection, getCountFromServer, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const [stats, setStats] = useState({
    users: 0,
    questions: 0,
    internships: 0,
    resources: 0
  });
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnapshot = await getCountFromServer(collection(db, 'users'));
        const questionsSnapshot = await getCountFromServer(collection(db, 'questions'));
        const internshipsSnapshot = await getCountFromServer(collection(db, 'internships'));
        const notesSnapshot = await getCountFromServer(collection(db, 'notes'));
        const coursesSnapshot = await getCountFromServer(collection(db, 'courses'));

        setStats({
          users: usersSnapshot.data().count,
          questions: questionsSnapshot.data().count,
          internships: internshipsSnapshot.data().count,
          resources: notesSnapshot.data().count + coursesSnapshot.data().count
        });

        // Fetch realtime feedbacks
        const feedbacksQuery = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'), limit(6));
        const feedbacksSnap = await getDocs(feedbacksQuery);
        const fetchedFeedbacks: any[] = [];
        feedbacksSnap.forEach(doc => {
          fetchedFeedbacks.push({ id: doc.id, ...doc.data() });
        });
        setFeedbacks(fetchedFeedbacks);
      } catch (error) {
        console.error("Error fetching stats or feedbacks:", error);
      }
    }
    fetchStats();
  }, []);
  
  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32 flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#2563EB_100%)] opacity-20 dark:opacity-40" />
          
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                The Ultimate Placement Preparation Platform
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Crack Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Dream Placement</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Master Data Structures, System Design, and Aptitude. Practice mock tests and get interview-ready with our comprehensive platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link 
                href={user ? "/dashboard" : "/register"}
                className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base shadow-lg shadow-primary/25")}
              >
                {user ? "Go to Dashboard" : "Start Learning"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href={user ? "/dsa" : "/register"}
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-12 px-8 text-base glass")}
              >
                Explore Questions
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Telegram Banner Section */}
        <section className="bg-gradient-to-r from-[#0088cc]/10 via-[#0088cc]/5 to-transparent border-y border-[#0088cc]/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0088cc]/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#0088cc]" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.98 1.25-5.59 3.69-.53.36-1.01.53-1.44.52-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.07-.78 4.2-1.82 7-3.03 8.39-3.61 3.99-1.67 4.82-1.96 5.36-1.97.12 0 .38.03.52.14.12.1.16.23.18.33.01.09.02.26.01.37z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Join our Telegram Community</h3>
                  <p className="text-muted-foreground">Get daily updates, exclusive internships, and placement materials directly on your phone!</p>
                </div>
              </div>
              <a 
                href="https://t.me/placementreadyanddsaquestions" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "bg-[#0088cc] hover:bg-[#0077b3] text-white shrink-0 shadow-lg shadow-[#0088cc]/25 border-0")}
              >
                Join Telegram Group
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Everything you need to succeed</h2>
              <p className="mt-4 text-muted-foreground text-lg">Comprehensive tools and resources for your interview journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "DSA Questions", icon: Code2, desc: "Curated list of important coding questions categorized by topic and difficulty." },
                { title: "Company specific", icon: Briefcase, desc: "Practice questions asked in Google, Amazon, Microsoft and other top companies." },
                { title: "Mock Tests", icon: Trophy, desc: "Time-bound mock tests to simulate real interview and assessment environments." },
                { title: "Detailed Analytics", icon: LineChart, desc: "Track your progress, view strengths and identify areas for improvement." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 rounded-2xl flex flex-col items-center text-center space-y-4 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 border-t border-border/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Your Path to Success</h2>
              <p className="mt-4 text-muted-foreground text-lg">Three simple steps to land your dream job</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
              
              {[
                { step: "1", title: "Learn & Practice", desc: "Master core concepts through our structured DSA sheets and curated study materials." },
                { step: "2", title: "Test Your Skills", desc: "Take company-specific mock tests in a simulated real-world interview environment." },
                { step: "3", title: "Get Placed", desc: "Apply for exclusive internships and get ready to ace your technical interviews." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary shadow-xl">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-semibold mt-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-24 bg-primary/5 border-y border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="container px-4 md:px-6 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: stats.users.toString(), label: "Registered Students", icon: Users },
                { number: stats.questions.toString(), label: "Practice Questions", icon: BookOpen },
                { number: stats.internships.toString(), label: "Internship Opportunities", icon: Building },
                { number: stats.resources.toString(), label: "Study Resources", icon: Trophy }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-3"
                >
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    <CountUp end={parseInt(stat.number)} duration={2.5} separator="," />
                  </h3>
                  <p className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Realtime Feedback / Testimonials Section */}
        {feedbacks.length > 0 && (
          <section id="testimonials" className="py-24 bg-muted/30">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">What Our Students Say</h2>
                <p className="mt-4 text-muted-foreground text-lg">Real feedback from real students on our platform.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map((fb, i) => (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-5 h-5 ${star <= fb.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} 
                          />
                        ))}
                      </div>
                      <p className="text-foreground italic mb-6">"{fb.review}"</p>
                    </div>
                    <div className="flex items-center gap-3 border-t pt-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {fb.userName ? fb.userName.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{fb.userName}</p>
                        <p className="text-xs text-muted-foreground">Student</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start your journey?</h2>
            <p className="text-xl text-muted-foreground mb-8">Join thousands of students who have already cracked their dream placements using our platform.</p>
            <Link 
              href={user ? "/dashboard" : "/register"}
              className={cn(buttonVariants({ size: "lg" }), "h-14 px-10 text-lg shadow-2xl shadow-primary/30")}
            >
              {user ? "Go to Dashboard" : "Create Free Account"} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
