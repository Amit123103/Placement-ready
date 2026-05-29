const fs = require('fs');
const path = require('path');

function refactorFile(filePath, collectionName) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add Firebase imports right after React imports
  content = content.replace(/(import .*? from "react";\r?\n)/, 
    `$1// Firebase imports\nimport { db } from "@/lib/firebase";\nimport { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";\n`);

  // 2. Replace fetch logic for list
  content = content.replace(/const res = await fetch\("http:\/\/localhost:3001\/api\/.*?"\);\r?\n\s+if \(!res\.ok\) throw new Error\("API Error"\);\r?\n\s+const data = await res\.json\(\);\r?\n\s+set([A-Za-z]+)\(data\);/g, 
  (match, p1) => {
    return `const querySnapshot = await getDocs(collection(db, "${collectionName}"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        data.push({ id: document.id, ...document.data() });
      });
      set${p1}(data);`;
  });
  
  // 3. Replace fetch logic for published articles
  content = content.replace(/const res = await fetch\("http:\/\/localhost:3001\/api\/.*?"\);\r?\n\s+if \(!res\.ok\) throw new Error\("API Error"\);\r?\n\s+const allData = await res\.json\(\);\r?\n\s+const data = allData\.filter\(\(d: any\) => d\.status === "Published"\);\r?\n\s+setArticles\(data\);/g,
  `const querySnapshot = await getDocs(collection(db, "${collectionName}"));
      const data: any[] = [];
      querySnapshot.forEach((document) => {
        const d = document.data();
        if (d.status === "Published") {
          data.push({ id: document.id, ...d });
        }
      });
      setArticles(data);`);

  // 4. Replace Add logic
  content = content.replace(/const res = await fetch\("http:\/\/localhost:3001\/api\/.*?", \{\r?\n\s+method: "POST", headers: \{ "Content-Type": "application\/json" \}, body: JSON\.stringify\((.*?)\)\r?\n\s+\}\);\r?\n\s+if \(!res\.ok\) throw new Error\("Add failed"\);\r?\n\s+const (.*?) = await res\.json\(\);\r?\n\s+set([A-Za-z]+)\(\[\.\.\.(.*?), \2\]\);/g, 
  (match, p1, p2, p3, p4) => {
    return `const docRef = await addDoc(collection(db, "${collectionName}"), ${p1});
        set${p3}([...${p4}, { ...${p1}, id: docRef.id }]);`;
  });

  // 5. Replace Edit logic
  content = content.replace(/const res = await fetch\(`http:\/\/localhost:3001\/api\/.*?\/\$\{(.*?)\.id\}`\, \{\r?\n\s+method: "PUT", headers: \{ "Content-Type": "application\/json" \}, body: JSON\.stringify\(formData\)\r?\n\s+\}\);\r?\n\s+if \(!res\.ok\) throw new Error\("Update failed"\);\r?\n\s+const updatedDoc = await res\.json\(\);\r?\n\s+set([A-Za-z]+)\((.*?)\.map\(\((.*?): any\) => \3\.id === \1\.id \? updatedDoc : \3\)\);/g, 
  (match, p1, p2, p3, p4) => {
    return `await updateDoc(doc(db, "${collectionName}", ${p1}.id), formData);
        set${p2}(${p3}.map((${p4}: any) => ${p4}.id === ${p1}.id ? { ...formData, id: ${p1}.id } : ${p4}));`;
  });

  // 6. Replace delete logic
  content = content.replace(/const res = await fetch\(`http:\/\/localhost:3001\/api\/.*?\/\$\{id\}`\, \{ method: "DELETE" \}\); if \(!res\.ok\) throw new Error\("Delete failed"\);/g, 
  `await deleteDoc(doc(db, "${collectionName}", id));`);

  // Clean up error messages
  content = content.replace(/Failed to connect to Local API\./g, 'Failed to connect to Firebase database. Have you configured your .env.local keys?');
  content = content.replace(/Could not load questions\. Check if API is running\./g, 'Could not load questions. If you are the admin, please check your Firebase .env.local configuration.');
  content = content.replace(/Could not load articles\. Check if API is running\./g, 'Could not load articles. If you are the admin, please check your Firebase .env.local configuration.');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Refactored back to Firebase:', filePath);
}

const adminAppPath = path.join(process.cwd(), 'admin-app', 'src', 'app');
const userAppPath = path.join(process.cwd(), 'user-app', 'src', 'app');

refactorFile(path.join(adminAppPath, 'questions', 'page.tsx'), 'questions');
refactorFile(path.join(adminAppPath, 'mock-tests', 'page.tsx'), 'mockTests');
refactorFile(path.join(adminAppPath, 'users', 'page.tsx'), 'users');
refactorFile(path.join(adminAppPath, 'articles', 'page.tsx'), 'articles');

refactorFile(path.join(userAppPath, 'dsa', 'page.tsx'), 'questions');
refactorFile(path.join(userAppPath, 'articles', 'page.tsx'), 'articles');

// special GET for single article
const articleDetailPath = path.join(userAppPath, 'articles', '[id]', 'page.tsx');
let detailContent = fs.readFileSync(articleDetailPath, 'utf8');
detailContent = detailContent.replace(/(import .*? from "react";\r?\n)/, 
    `$1// Firebase imports\nimport { db } from "@/lib/firebase";\nimport { doc, getDoc } from "firebase/firestore";\n`);

detailContent = detailContent.replace(/const res = await fetch\(`http:\/\/localhost:3001\/api\/articles\/\$\{resolvedParams\.id\}`\);\r?\n\s+if \(res\.ok\) \{\r?\n\s+const data = await res\.json\(\);\r?\n\s+setArticle\(data\);\r?\n\s+\} else \{\r?\n\s+setError\("Article not found\."\);\r?\n\s+\}/s, 
  `const docRef = doc(db, "articles", resolvedParams.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArticle({ id: docSnap.id, ...docSnap.data() } as any);
      } else {
        setError("Article not found.");
      }`);
fs.writeFileSync(articleDetailPath, detailContent, 'utf8');
console.log('Refactored back to Firebase:', articleDetailPath);
