const fs = require('fs');
const path = require('path');

function printTree(dir, prefix = '') {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return;
    }
    const filteredFiles = files.filter(f => !['node_modules', '.git', 'dist', 'build', '.vscode'].includes(f));
    
    filteredFiles.forEach((file, index) => {
        const isLast = index === filteredFiles.length - 1;
        console.log(prefix + (isLast ? '└── ' : '├── ') + file);
        
        const filePath = path.join(dir, file);
        let stat;
        try { stat = fs.statSync(filePath); } catch (e) {}
        if (stat && stat.isDirectory()) {
            printTree(filePath, prefix + (isLast ? '    ' : '│   '));
        }
    });
}

console.log('new');
printTree('c:\\\\Users\\\\mayan\\\\new');
