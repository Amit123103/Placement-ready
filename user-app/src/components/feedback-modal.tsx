"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, Star, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function FeedbackModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      await addDoc(collection(db, "feedbacks"), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "Student",
        rating,
        review,
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setRating(0);
        setReview("");
      }, 2000);
    } catch (e: any) {
      setError(e.message || "Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all z-50 flex items-center justify-center p-0"
            aria-label="Leave Feedback"
          />
        }
      >
        <MessageSquarePlus className="w-6 h-6" />
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">We value your feedback!</DialogTitle>
          <DialogDescription className="text-center">
            Let us know what you think of PlacementReady. Your reviews help us improve and inspire other students.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-lg font-bold">Thank you for your feedback!</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea 
                placeholder="Tell us what you love about the platform or how we can improve..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
            
            {error && <p className="text-destructive text-sm font-medium text-center">{error}</p>}

            <Button 
              className="w-full h-12 text-lg shadow-lg" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
