"use client";

import { use, useState, useEffect } from "react";
// Firebase imports
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Calendar, User } from "lucide-react";
import Link from "next/link";



interface Article {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  status: string;
  content: string;
}

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [resolvedParams.id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "articles", resolvedParams.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArticle({ id: docSnap.id, ...docSnap.data() } as any);
      } else {
        setError("Article not found.");
      }
    } catch (err: any) {
      console.error("Error fetching article:", err);
      setError("Could not load article.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12">
          <Link href="/articles" className={cn(buttonVariants({ variant: "ghost" }), "mb-8 -ml-4 text-muted-foreground hover:text-foreground")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Articles
          </Link>

          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-muted rounded w-3/4"></div>
              <div className="flex gap-4">
                <div className="h-6 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-32"></div>
              </div>
              <div className="space-y-3 pt-8">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          ) : error || !article ? (
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-destructive">{error || "Article not found"}</h1>
            </div>
          ) : (
            <article className="prose dark:prose-invert max-w-none lg:prose-lg">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                {article.title}
              </h1>
              
              <div className="flex items-center gap-6 text-muted-foreground border-b pb-8 mb-8">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium text-foreground">{article.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{article.publishDate}</span>
                </div>
              </div>

              {/* In a real production app, we would use a markdown parser like react-markdown here. 
                  For now, we output the raw text respecting line breaks. */}
              <div className="whitespace-pre-wrap leading-relaxed">
                {article.content}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
