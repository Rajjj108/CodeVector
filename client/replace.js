import fs from 'fs';
import path from 'path';

const target = 'http://localhost:5000';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            walk(full);
        } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
            let content = fs.readFileSync(full, 'utf8');
            if (content.includes(target)) {
                let newContent = content.replace(/['"]http:\/\/localhost:5000(\/.*?)?['"]/g, (match, pathGroup) => {
                    const envVar = '(import.meta.env.VITE_API_URL || "http://localhost:5000")';
                    if (pathGroup) {
                        return envVar + ' + "' + pathGroup + '"';
                    }
                    return envVar;
                });
                
                newContent = newContent.replace(/`http:\/\/localhost:5000(\/.*?)`/g, (match, pathGroup) => {
                    return '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}' + pathGroup + '`';
                });
                
                if (content !== newContent) {
                    fs.writeFileSync(full, newContent, 'utf8');
                    console.log('Updated', full);
                } else {
                    console.log('Skipped string replace for (might be just substring)', full);
                }
            }
        }
    }
}
walk('./src');
