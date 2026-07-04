"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Users, FileQuestion, GraduationCap, LineChartIcon, BookOpen, Briefcase, Code2, FileText, PlayCircle, Building2, Terminal, Send, CheckSquare, Settings } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const adminMenu = [
  { title: "Dashboard", url: "/", icon: LineChartIcon },
  { title: "Broadcast Email", url: "/broadcast-email", icon: Send },
  { title: "Questions Management", url: "/questions", icon: FileQuestion },
  { title: "Submissions", url: "/submissions", icon: Terminal },
  { title: "User Management", url: "/users", icon: Users },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Mock Tests", url: "/mock-tests", icon: GraduationCap },
  { title: "Mock Submissions", url: "/mock-test-submissions", icon: CheckSquare },
  { title: "Articles", url: "/articles", icon: BookOpen },
  { title: "Internships", url: "/internships", icon: Briefcase },
  { title: "Projects", url: "/projects", icon: Code2 },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Courses", url: "/courses", icon: PlayCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <Sidebar>
            <SidebarHeader className="h-16 flex items-center px-4 border-b">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="PlacementReady Admin" className="h-8 w-auto" />
                <span className="inline-block font-bold text-lg text-primary">
                  Admin Panel
                </span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminMenu.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          tooltip={item.title}
                          render={
                            <Link href={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <div className="flex-col w-full flex">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <div className="flex-1" />
              <ThemeToggle />
              <Button variant="outline" onClick={logout}>
                Log out
              </Button>
            </header>

            <main className="flex-1 space-y-4 p-8 pt-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
