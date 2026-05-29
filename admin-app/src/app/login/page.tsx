"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { isSignInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";

function LoginContent() {
  const [email, setEmail] = useState("rik0rik8957@gmail.com");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { sendLoginLink, verifyLoginLink, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await sendLoginLink(email);
      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error?.message || "Failed to send verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await verifyLoginLink(email, otp);
      router.push("/");
    } catch (error: any) {
      setErrorMessage(error?.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md mx-auto p-8 rounded-3xl bg-background/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30"
        >
          <ShieldCheck className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          Admin Portal
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Secure OTP authentication
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-5"
          >
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-6 rounded-2xl text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <Mail className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg">Code Sent</h3>
              <p className="text-sm opacity-90">
                We've sent a 6-digit verification code to <br/><strong className="font-medium">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="otp" className="text-sm font-medium ml-1">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="------"
                  className="block w-full text-center tracking-[0.5em] text-xl font-bold py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                  disabled={isSubmitting}
                />
              </div>

              {errorMessage && (
                <div className="flex items-start space-x-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={otp.length !== 6 || isSubmitting}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Verify & Login</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => {
                  setStatus("idle");
                  setErrorMessage("");
                  setOtp("");
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hover:underline"
              >
                Try another email
              </button>
            </div>
          </motion.div>
        )}

        {(status === "idle" || status === "error") && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-purple-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@placementready.com"
                    className="block w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {status === "error" && errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-start space-x-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none mix-blend-screen" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 dark:opacity-20 pointer-events-none" />

      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
