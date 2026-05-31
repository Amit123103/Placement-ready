"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Send, Loader2 } from "lucide-react";

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

interface CodeEditorProps {
  testCases: { input: string; output: string }[];
  onRun: (output: string, error: string) => void;
  onSubmit: (code: string, language: string, passed: boolean) => void;
}

export function CodeEditor({ testCases, onRun, onSubmit }: CodeEditorProps) {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGE_BOILERPLATES[LANGUAGES[0].id]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langId = e.target.value;
    const selected = LANGUAGES.find(l => l.id === langId) || LANGUAGES[0];
    setLanguage(selected);
    setCode(LANGUAGE_BOILERPLATES[selected.id] || "");
  };

  const executeCode = async (sourceCode: string, input: string) => {
    // Using Piston public API
    const response = await fetch("https://emacsx.piston.rs/api/v2/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: language.id,
        version: language.version,
        files: [{ content: sourceCode }],
        stdin: input
      })
    });
    
    if (!response.ok) {
        throw new Error("Failed to execute code via Piston API.");
    }

    return await response.json();
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const input = testCases.length > 0 ? testCases[0].input : "";
      const result = await executeCode(code, input);
      
      const output = result.run.stdout;
      const error = result.run.stderr || (result.compile ? result.compile.stderr : "");
      
      onRun(output, error);
    } catch (err: any) {
      onRun("", err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let allPassed = true;
    
    try {
        if (testCases.length === 0) {
            allPassed = true; // No test cases means pass by default
        } else {
            for (const tc of testCases) {
                const result = await executeCode(code, tc.input);
                const output = result.run.stdout.trim();
                if (output !== tc.output.trim() || result.run.stderr) {
                    allPassed = false;
                    break;
                }
            }
        }
        onSubmit(code, language.name, allPassed);
    } catch (err: any) {
        onSubmit(code, language.name, false);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border rounded-md overflow-hidden">
      <div className="flex justify-between items-center bg-muted/50 p-2 border-b">
        <select 
          className="bg-background text-foreground text-sm rounded px-2 py-1 border outline-none"
          value={language.id}
          onChange={handleLanguageChange}
        >
          {LANGUAGES.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning || isSubmitting}>
            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Submit
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-[400px]">
        <Editor
          height="100%"
          language={language.id === "csharp" ? "csharp" : language.id === "cpp" ? "cpp" : language.id}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}
