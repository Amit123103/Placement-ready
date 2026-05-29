const fs = require('fs');
const path = require('path');

function refactorFile(filePath, collectionName) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove Firebase imports
  content = content.replace(/\/\/ Firebase imports\r?\nimport \{ db \} from "@\/lib\/firebase";\r?\nimport \{ collection, getDocs, addDoc, updateDoc, deleteDoc, doc \} from "firebase\/firestore";/g, '');
  content = content.replace(/\/\/ Firebase imports\r?\nimport \{ db \} from "@\/lib\/firebase";\r?\nimport \{ doc, getDoc \} from "firebase\/firestore";/g, '');
  content = content.replace(/import \{ collection, getDocs \} from "firebase\/firestore";\r?\nimport \{ db \} from "@\/lib\/firebase";/g, '');
  content = content.replace(/\/\/ Firebase imports\nimport \{ db \} from "@\/lib\/firebase";\nimport \{ collection, getDocs \} from "firebase\/firestore";/g, '');

  // 2. Replace fetch logic
  content = content.replace(/const querySnapshot = await getDocs\(collection\(db, ".*?"\)\);\r?\n\s+const data: .*?\[\] = \[\];\r?\n\s+querySnapshot\.forEach\(\(document\) => \{\r?\n\s+(.*?)\r?\n\s+\}\);\r?\n\s+set.*?\(data\);/s, (match, p1) => {
    if (p1.includes('status === "Published"')) {
      return `const res = await fetch("http://localhost:3001/api/${collectionName}");
      if (!res.ok) throw new Error("API Error");
      const allData = await res.json();
      const data = allData.filter((d: any) => d.status === "Published");
      setArticles(data);`;
    }
    const stateSetterMatch = match.match(/set[A-Z][a-zA-Z]+\(data\)/);
    return `const res = await fetch("http://localhost:3001/api/${collectionName}");
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      ${stateSetterMatch ? stateSetterMatch[0] : 'setItems(data)'};`;
  });

  // 3. Replace single fetch logic (for articles/[id])
  content = content.replace(/const docRef = doc\(db, ".*?", resolvedParams\.id\);\r?\n\s+const docSnap = await getDoc\(docRef\);\r?\n\s+if \(docSnap\.exists\(\)\) \{\r?\n\s+setArticle\(\{ id: docSnap\.id, \.\.\.docSnap\.data\(\) \} as Article\);\r?\n\s+\} else \{\r?\n\s+setError\("Article not found\."\);\r?\n\s+\}/s, 
  `const res = await fetch(\`http://localhost:3001/api/${collectionName}/\${resolvedParams.id}\`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
      } else {
        setError("Article not found.");
      }`);

  // 4. Replace delete logic
  content = content.replace(/await deleteDoc\(doc\(db, ".*?", id\)\);/g, `const res = await fetch(\`http://localhost:3001/api/${collectionName}/\${id}\`, { method: "DELETE" }); if (!res.ok) throw new Error("Delete failed");`);

  // 5. Replace Add logic
  // Handle newArticle vs formData
  content = content.replace(/const docRef = await addDoc\(collection\(db, ".*?"\), (.*?)\);\r?\n\s+set.*?\(\[\.\.\..*?, \{ \.\.\..*?, id: docRef\.id \}\]\);/g, (match, p1) => {
    const stateSetterMatch = match.match(/set[A-Z][a-zA-Z]+\(\[\.\.\.(.*?),/);
    const arrayName = stateSetterMatch ? stateSetterMatch[1] : 'items';
    const stateSetter = stateSetterMatch ? stateSetterMatch[0].split('(')[0] : 'setItems';
    return `const res = await fetch("http://localhost:3001/api/${collectionName}", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(${p1})
        });
        if (!res.ok) throw new Error("Add failed");
        const newDoc = await res.json();
        ${stateSetter}([...${arrayName}, newDoc]);`;
  });

  // 6. Replace Edit logic
  content = content.replace(/await updateDoc\(doc\(db, ".*?", (.*?)\.id\), formData\);\r?\n\s+set.*?\((.*?)\.map\((.*?) => .*?\.id === \1\.id \? \{ \.\.\.(.*?), id: \1\.id \} : \3\)\);/g, (match, p1, p2, p3, p4) => {
    const stateSetterMatch = match.match(/set[A-Z][a-zA-Z]+\(/);
    const stateSetter = stateSetterMatch ? stateSetterMatch[0].slice(0, -1) : 'setItems';
    return `const res = await fetch(\`http://localhost:3001/api/${collectionName}/\${${p1}.id}\`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("Update failed");
        const updatedDoc = await res.json();
        ${stateSetter}(${p2}.map((${p3}: any) => ${p3}.id === ${p1}.id ? updatedDoc : ${p3}));`;
  });

  // Clean up error messages
  content = content.replace(/Failed to connect to Firebase database\. Have you configured your \.env\.local keys\?/g, 'Failed to connect to Local API.');
  content = content.replace(/Could not load questions\. If you are the admin, please check your Firebase \.env\.local configuration\./g, 'Could not load questions. Check if API is running.');
  content = content.replace(/Could not load articles\. If you are the admin, please check your Firebase \.env\.local configuration\./g, 'Could not load articles. Check if API is running.');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Refactored', filePath);
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
detailContent = detailContent.replace(/\/\/ Firebase imports\r?\nimport \{ db \} from "@\/lib\/firebase";\r?\nimport \{ doc, getDoc \} from "firebase\/firestore";/g, '');
detailContent = detailContent.replace(/const docRef = doc\(db, "articles", resolvedParams\.id\);\r?\n\s+const docSnap = await getDoc\(docRef\);\r?\n\s+if \(docSnap\.exists\(\)\) \{\r?\n\s+setArticle\(\{ id: docSnap\.id, \.\.\.docSnap\.data\(\) \} as Article\);\r?\n\s+\} else \{\r?\n\s+setError\("Article not found\."\);\r?\n\s+\}/s, 
  `const res = await fetch(\`http://localhost:3001/api/articles/\${resolvedParams.id}\`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
      } else {
        setError("Article not found.");
      }`);
fs.writeFileSync(articleDetailPath, detailContent, 'utf8');
console.log('Refactored', articleDetailPath);
