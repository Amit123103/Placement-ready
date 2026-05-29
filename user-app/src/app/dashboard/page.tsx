"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Code2, LineChart, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: "Questions Solved", value: "0", icon: Code2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Mock Tests Taken", value: "0", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Current Streak", value: "0 days", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Overall Rank", value: "Unranked", icon: LineChart, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/30 min-h-[calc(100vh-140px)] py-10">
        <div className="container max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-2"
          >
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.email ? user.email.split("@")[0] : "Student"}!
            </h1>
            <p className="text-muted-foreground">Here is your progress overview and what you can do next.</p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <div className={cn("p-2 rounded-full", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full border-white/10 shadow-lg">
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                    <h3 className="font-semibold mb-1">Data Structures & Algorithms</h3>
                    <p className="text-sm text-muted-foreground mb-4">Pick up where you left off in arrays.</p>
                    <Link href="/dsa" className={cn(buttonVariants({ size: "sm" }), "w-full sm:w-auto")}>
                      Resume Practice <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full border-white/10 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground space-y-2">
                    <Clock className="h-8 w-8 opacity-20" />
                    <p className="text-sm">No recent activity yet.<br/>Start practicing to see your history!</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
