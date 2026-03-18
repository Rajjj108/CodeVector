const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = [
  'node_modules', '.git', 'dist', 'build', 
  '.gemini', 'package-lock.json', '.env', 
  '.vscode', '.idea', 'replace_lc.cjs', 'replace_lc.js'
];
const ALLOWED_EXTS = ['.js', '.jsx', '.json', '.html', '.md', '.css'];

function replaceInString(content) {
  let newContent = content;
  
  newContent = newContent.replace(/\bLC_/g, 'CV_'); 
  newContent = newContent.replace(/\bLC\b/g, 'CV');
  newContent = newContent.replace(/\bLeetCode\b/g, 'CodeVector');
  newContent = newContent.replace(/\bLeetcode\b/g, 'Codevector');
  newContent = newContent.replace(/\bleetcode\b/g, 'codevector');
  newContent = newContent.replace(/\bLeetCode's\b/g, "CodeVector's");
  
  return newContent;
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (ALLOWED_EXTS.includes(ext) || ext === '') {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const newContent = replaceInString(content);
          if (content !== newContent) {
             fs.writeFileSync(fullPath, newContent, 'utf8');
             console.log(`Updated: ${fullPath}`);
          }
        } catch (e) {
          console.error(`Failed to process ${fullPath}:`, e.message);
        }
      }
    }
  }
}

console.log("Starting replacement...");
processDirectory(__dirname);
console.log("Done.");
