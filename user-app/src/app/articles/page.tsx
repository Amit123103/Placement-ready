"use client";

import { useState, useEffect } from "react";
// Firebase imports
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";



interface Article {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  status: string;
  content: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "articles"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        const d = document.data();
        if (d.status === "Published") {
          data.push({ id: document.id, ...d });
        }
      });
      setArticles(data);
    } catch (err: any) {
      console.error("Error fetching articles:", err);
      setError("Could not load articles. If you are the admin, please check your Firebase .env.local configuration.");
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/20 min-h-screen">
        <div className="bg-background border-b py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-primary" /> 
              Articles & Publications
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Read interview experiences, system design deep dives, and expert tips to crack your dream company.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-3 mb-8">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">
              Loading articles...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
              No articles found.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card flex flex-col rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/50 group"
                >
                  <div className="h-40 bg-muted flex items-center justify-center border-b">
                     {/* Placeholder Cover Image */}
                     <BookOpen className="w-12 h-12 text-muted-foreground opacity-20 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="text-xs">{a.publishDate}</Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">By {a.author}</p>
                    
                    <div className="mt-auto pt-4">
                      <Link 
                        href={`/articles/${a.id}`}
                        className={cn(buttonVariants({ variant: "default" }), "w-full")}
                      >
                        Read Article
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
