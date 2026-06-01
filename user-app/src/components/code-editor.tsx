"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Send, Loader2, Moon, Sun, CheckCircle2, XCircle, Terminal, AlertCircle } from "lucide-react";

export const LANGUAGES = [
  { id: "javascript", name: "JavaScript", version: "18.15.0" },
  { id: "python", name: "Python", version: "3.10.0" },
  { id: "java", name: "Java", version: "15.0.2" },
  { id: "c", name: "C", version: "10.2.0" },
  { id: "cpp", name: "C++", version: "10.2.0" },
  { id: "csharp", name: "C#", version: "6.12.0" },
  { id: "r", name: "R", version: "4.1.1" },
  { id: "go", name: "Go", version: "1.16.2" },
  { id: "ruby", name: "Ruby", version: "3.0.1" },
  { id: "rust", name: "Rust", version: "1.68.2" }
];

export const LANGUAGE_BOILERPLATES: Record<string, string> = {
  javascript: `// Read from stdin and write to stdout
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let input = "";
rl.on('line', (line) => {
    input += line + '\\n';
});

rl.on('close', () => {
    // Write your code here
    console.log(input.trim());
});
`,
  python: `# Read from stdin and write to stdout
import sys

def main():
    input_data = sys.stdin.read().strip()
    # Write your code here
    print(input_data)

if __name__ == "__main__":
    main()
`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your code here
        while(scanner.hasNextLine()) {
            System.out.println(scanner.nextLine());
        }
        scanner.close();
    }
}
`,
  c: `#include <stdio.h>

int main() {
    char buffer[1024];
    // Write your code here
    while (fgets(buffer, sizeof(buffer), stdin) != NULL) {
        printf("%s", buffer);
    }
    return 0;
}
`,
  cpp: `#include <iostream>
#include <string>

using namespace std;

int main() {
    string line;
    // Write your code here
    while (getline(cin, line)) {
        cout << line << endl;
    }
    return 0;
}
`,
  csharp: `using System;

class Program {
    static void Main() {
        // Write your code here
        string line;
        while ((line = Console.ReadLine()) != null) {
            Console.WriteLine(line);
        }
    }
}
`,
  r: `# Read from stdin and write to stdout
f <- file("stdin")
open(f)
while(length(line <- readLines(f,n=1)) > 0) {
  # Write your code here
  write(line, stdout())
}
`,
  go: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    // Write your code here
    for scanner.Scan() {
        fmt.Println(scanner.Text())
    }
}
`,
  ruby: `# Read from stdin and write to stdout
$stdin.each_line do |line|
  # Write your code here
  puts line
end
`,
  rust: `use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    // Write your code here
    for line in stdin.lock().lines() {
        println!("{}", line.unwrap());
    }
}
`
};

interface TestCaseResult {
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    error: string;
}

interface CodeEditorProps {
  testCases: { input: string; output: string }[];
  onRun?: (output: string, error: string) => void;
  onSubmit?: (code: string, language: string, passed: boolean, testResults?: TestCaseResult[]) => void;
  readOnly?: boolean;
  initialCode?: string;
  initialLanguage?: string;
  allowCopyPaste?: boolean;
}

export function CodeEditor({ testCases, onRun, onSubmit, readOnly = false, initialCode, initialLanguage, allowCopyPaste = true }: CodeEditorProps) {
  const defaultLang = LANGUAGES.find(l => l.name === initialLanguage) || LANGUAGES[0];
  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState(initialCode || LANGUAGE_BOILERPLATES[defaultLang.id]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langId = e.target.value;
    const selected = LANGUAGES.find(l => l.id === langId) || LANGUAGES[0];
    setLanguage(selected);
    if (!readOnly) {
      setCode(LANGUAGE_BOILERPLATES[selected.id] || "");
    }
    setTestResults(null);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    if (allowCopyPaste === false) {
      editor.onKeyDown((e: any) => {
        // block Ctrl/Cmd + C, V, X
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isModifier = isMac ? e.metaKey : e.ctrlKey;
        if (isModifier && (e.browserEvent.key === 'c' || e.browserEvent.key === 'v' || e.browserEvent.key === 'x')) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "vs-dark" ? "light" : "vs-dark");
  };

  const executeCode = async (sourceCode: string, input: string) => {
    // Calling our secure Next.js API route instead of the public piston URL directly
    const response = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: language.id,
        code: sourceCode,
        stdin: input
      })
    });
    
    if (!response.ok) {
        throw new Error("Execution server error.");
    }

    return await response.json();
  };

  const extractLineNumber = (errorMsg: string): string | null => {
    // Simple heuristic to find line numbers in typical error stacks
    const match = errorMsg.match(/line (\d+)/i) || errorMsg.match(/:(\d+):(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  const handleRun = async () => {
    if (!onRun) return;
    setIsRunning(true);
    setTestResults(null);
    try {
      const input = testCases.length > 0 ? testCases[0].input : "";
      const result = await executeCode(code, input);
      
      const output = result.stdout || "";
      const error = result.stderr || "";
      
      let finalError = error;
      if (finalError) {
        const line = extractLineNumber(finalError);
        if (line) {
           finalError = `\n[Line ${line}] ` + finalError;
        }
      }
      
      onRun(output, finalError);
    } catch (err: any) {
      onRun("", err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setIsSubmitting(true);
    let allPassed = true;
    const results: TestCaseResult[] = [];
    
    try {
        if (testCases.length === 0) {
            allPassed = true; 
        } else {
            for (const tc of testCases) {
                try {
                  const result = await executeCode(code, tc.input);
                  const actualOut = (result.stdout || "").trim();
                  const expectedOut = tc.output.trim();
                  const err = result.stderr || "";
                  
                  const passed = actualOut === expectedOut && !err;
                  if (!passed) allPassed = false;
                  
                  let formattedError = err;
                  if (err) {
                    const line = extractLineNumber(err);
                    if (line) {
                      formattedError = `Error detected near line ${line}:\n${err}`;
                    }
                  }

                  results.push({
                      passed,
                      actualOutput: actualOut,
                      expectedOutput: expectedOut,
                      error: formattedError
                  });
                } catch(e: any) {
                   allPassed = false;
                   results.push({
                       passed: false,
                       actualOutput: "",
                       expectedOutput: tc.output.trim(),
                       error: e.message || "Failed to execute"
                   });
                }
            }
        }
        setTestResults(results);
        onSubmit(code, language.name, allPassed, results);
    } catch (err: any) {
        onSubmit(code, language.name, false, results);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col h-full border rounded-xl overflow-hidden ${theme === 'vs-dark' ? 'bg-[#1e1e1e] border-border/20' : 'bg-white border-border/60'}`}>
      {/* Editor Header */}
      <div className={`flex justify-between items-center p-3 border-b ${theme === 'vs-dark' ? 'bg-[#2d2d2d] border-border/10' : 'bg-muted/30 border-border/40'}`}>
        <div className="flex items-center gap-3">
            <select 
              className={`text-sm rounded-lg px-3 py-1.5 border outline-none font-medium transition-colors ${theme === 'vs-dark' ? 'bg-[#1e1e1e] text-white border-white/10' : 'bg-white text-foreground border-border'}`}
              value={language.id}
              onChange={handleLanguageChange}
              disabled={readOnly}
            >
              {LANGUAGES.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            
            <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-full ${theme === 'vs-dark' ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/5 text-black/70'}`} 
                onClick={toggleTheme}
                title="Toggle Theme"
            >
                {theme === "vs-dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
        </div>
        
        {!readOnly && (
            <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning || isSubmitting} className={theme === 'vs-dark' ? 'bg-transparent text-white border-white/20 hover:bg-white/10' : ''}>
                {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                Run Code
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md shadow-emerald-900/20" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit
            </Button>
            </div>
        )}
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-[350px]">
        <Editor
          height="100%"
          language={language.id === "csharp" ? "csharp" : language.id === "cpp" ? "cpp" : language.id}
          theme={theme}
          value={code}
          onChange={(value) => !readOnly && setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            padding: { top: 20 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            readOnly: readOnly,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            contextmenu: allowCopyPaste !== false,
          }}
          onMount={handleEditorDidMount}
        />
      </div>

      {/* Test Results Panel (only shows if we submitted and have results) */}
      {testResults && testResults.length > 0 && (
          <div className={`border-t p-4 max-h-[300px] overflow-auto ${theme === 'vs-dark' ? 'bg-[#181818] border-white/10 text-white/90' : 'bg-slate-50 border-border/40 text-slate-800'}`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> 
                  Test Case Results
              </h3>
              
              {/* Tabs for Test Cases */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {testResults.map((res, idx) => (
                      <button 
                          key={idx}
                          onClick={() => setActiveTab(idx)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${activeTab === idx ? (theme === 'vs-dark' ? 'bg-white/10' : 'bg-white shadow-sm ring-1 ring-border') : 'opacity-70 hover:opacity-100'}`}
                      >
                          {res.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                          Test Case {idx + 1}
                      </button>
                  ))}
              </div>

              {/* Active Tab Content */}
              {testResults[activeTab] && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={testResults[activeTab].passed ? "default" : "destructive"} className={testResults[activeTab].passed ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30" : ""}>
                            {testResults[activeTab].passed ? "Passed" : "Failed"}
                        </Badge>
                      </div>

                      {testResults[activeTab].error && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap">
                              <div className="flex items-center gap-1.5 mb-1 font-bold"><AlertCircle className="w-4 h-4"/> Error Details:</div>
                              {testResults[activeTab].error}
                          </div>
                      )}

                      {!testResults[activeTab].passed && !testResults[activeTab].error && (
                          <div className="grid grid-cols-2 gap-4">
                              <div className={`p-3 rounded-lg text-sm font-mono whitespace-pre-wrap ${theme === 'vs-dark' ? 'bg-white/5' : 'bg-white border'}`}>
                                  <div className="text-xs font-bold uppercase mb-2 opacity-60">Expected Output:</div>
                                  <div className="text-emerald-500">{testResults[activeTab].expectedOutput || "<empty>"}</div>
                              </div>
                              <div className={`p-3 rounded-lg text-sm font-mono whitespace-pre-wrap ${theme === 'vs-dark' ? 'bg-white/5' : 'bg-white border'}`}>
                                  <div className="text-xs font-bold uppercase mb-2 opacity-60">Actual Output:</div>
                                  <div className="text-red-500">{testResults[activeTab].actualOutput || "<empty>"}</div>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
      )}
    </div>
  );
}

