"use client";

import { use } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, CheckCircle2, Play, Lightbulb, Clock, Database } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Mock data for the specific question
const mockQuestionData = {
  id: "1",
  title: "Two Sum",
  difficulty: "Easy",
  category: "Arrays",
  company: "Google, Amazon, Microsoft",
  description: `
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.
  `,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
    }
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ],
  solutionCode: `
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
  `
};

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15 app router, params should be unwrapped with React.use() if dynamic
  const resolvedParams = use(params);
  const q = mockQuestionData;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/20 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
          <Link href="/dsa" className={cn(buttonVariants({ variant: "ghost" }), "mb-4")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Problems
          </Link>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Panel: Question Details */}
            <div className="w-full lg:w-1/2 flex flex-col space-y-4">
              <Card className="glass-card flex-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{q.title}</h1>
                    <CheckCircle2 className="text-green-500 w-6 h-6" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <Badge variant="secondary" className="bg-opacity-20">{q.difficulty}</Badge>
                    <Badge variant="outline">{q.category}</Badge>
                    <Badge variant="outline" className="hidden sm:inline-flex">{q.company}</Badge>
                  </div>

                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="solution">Solution</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="description" className="space-y-6">
                      <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
                        {q.description.trim()}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" /> Examples
                        </h3>
                        {q.examples.map((ex, i) => (
                          <div key={i} className="bg-muted p-4 rounded-lg font-mono text-xs space-y-2">
                            <div><strong className="text-foreground">Input:</strong> {ex.input}</div>
                            <div><strong className="text-foreground">Output:</strong> {ex.output}</div>
                            {ex.explanation && <div><strong className="text-foreground">Explanation:</strong> {ex.explanation}</div>}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Database className="w-4 h-4 text-primary" /> Constraints
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {q.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="solution">
                      <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <pre className="text-xs font-mono">
                          <code>{q.solutionCode.trim()}</code>
                        </pre>
                      </div>
                      <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> Time: O(n)</div>
                        <div className="flex items-center gap-1"><Database className="w-4 h-4" /> Space: O(n)</div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Code Editor Mockup */}
            <div className="w-full lg:w-1/2 flex flex-col h-[600px] lg:h-auto">
              <Card className="glass-card flex-1 flex flex-col overflow-hidden">
                <div className="bg-muted/50 border-b p-3 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="font-mono bg-background">JavaScript</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Run</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Submit
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm overflow-y-auto">
                  <pre>
                    <code>
{`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
    
};`}
                    </code>
                  </pre>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
