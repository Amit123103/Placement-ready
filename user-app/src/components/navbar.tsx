"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button, buttonVariants } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="PlacementReady" className="h-10 w-auto" />
          </Link>
          {user ? (
            <nav className="hidden md:flex gap-6">
              <Link href="/dsa" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                DSA
              </Link>
              <Link href="/companies" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Companies
              </Link>
              <Link href="/mock-tests" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Mock Tests
              </Link>
              <Link href="/internships" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Internships
              </Link>
              <Link href="/projects" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Projects
              </Link>
              <Link href="/notes" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Notes
              </Link>
              <Link href="/courses" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Courses
              </Link>
              <Link href="/articles" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Articles
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex gap-6">
              <Link href="/#features" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="/#how-it-works" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
              <Link href="/#stats" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Statistics
              </Link>
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-sm font-medium hover:underline">
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Log out
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                  <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="space-x-2">
                <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                  Log in
                </Link>
                <Link href="/register" className={buttonVariants()}>
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
