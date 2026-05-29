"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileQuestion, GraduationCap, ArrowUpRight, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    questions: 0,
    mockTests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Real-time Users count
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setStats((prev) => ({ ...prev, users: snapshot.size }));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users count:", error);
      }
    );

    // 2. Real-time Questions count
    const unsubscribeQuestions = onSnapshot(
      collection(db, "questions"),
      (snapshot) => {
        setStats((prev) => ({ ...prev, questions: snapshot.size }));
      },
      (error) => {
        console.error("Error fetching questions count:", error);
      }
    );

    // 3. Real-time Mock Tests count
    const unsubscribeMockTests = onSnapshot(
      collection(db, "mockTests"),
      (snapshot) => {
        setStats((prev) => ({ ...prev, mockTests: snapshot.size }));
      },
      (error) => {
        console.error("Error fetching mock tests count:", error);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeQuestions();
      unsubscribeMockTests();
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.users}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  Real-time database active
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.questions}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  Real-time database active
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mock Tests Created</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.mockTests}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  Real-time database active
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
