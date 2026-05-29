"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button, buttonVariants } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 relative">
        <div className="flex gap-6 md:gap-10 items-center">
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
              <div className="hidden md:flex items-center space-x-4">
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
              <div className="hidden md:block space-x-2">
                <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                  Log in
                </Link>
                <Link href="/register" className={buttonVariants()}>
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Hamburger Menu Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 border-b border-border/40 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden animate-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-4">
            {user ? (
              <>
                <Link href="/dsa" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  DSA
                </Link>
                <Link href="/companies" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Companies
                </Link>
                <Link href="/mock-tests" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Mock Tests
                </Link>
                <Link href="/internships" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Internships
                </Link>
                <Link href="/projects" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Projects
                </Link>
                <Link href="/notes" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Notes
                </Link>
                <Link href="/courses" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Courses
                </Link>
                <Link href="/articles" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Articles
                </Link>
                <hr className="border-border/40 my-2" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 py-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{user.displayName || user.email?.split("@")[0] || "Student"}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-center text-sm font-medium h-9 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                    Dashboard
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => { logout(); setIsOpen(false); }} className="w-full justify-center">
                    Log out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/#features" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Features
                </Link>
                <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
                <Link href="/#stats" onClick={() => setIsOpen(false)} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Statistics
                </Link>
                <hr className="border-border/40 my-2" />
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsOpen(false)} className={buttonVariants({ variant: "ghost", className: "w-full justify-center" })}>
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className={buttonVariants({ className: "w-full justify-center" })}>
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
