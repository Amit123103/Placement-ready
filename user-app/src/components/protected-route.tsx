"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Define routes that do not require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/privacy",
  "/terms",
  "/contact"
];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      // Check if the current route is public
      const isPublic = publicRoutes.includes(pathname);
      
      if (!isPublic) {
        router.replace("/login");
      }
    }
  }, [user, loading, pathname, router]);

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isPublic = publicRoutes.includes(pathname);

  // If the user is not authenticated and the route is not public, render nothing while redirecting
  if (!user && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
