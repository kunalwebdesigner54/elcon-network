const fs = require('fs');
const path = require('path');

const cssDir = 'd:/work/nishikant/elcon-network/elcon-frontend/src';

const patterns = [
    /\.table-footer\s*\{[^}]*\}/g,
    /\.total-entries\s*\{[^}]*\}/g,
    /\.pagination\s*\{[^}]*\}/g,
    /\.page-btn\s*\{[^}]*\}/g,
    /\.page-btn:hover\s*\{[^}]*\}/g,
    /\.page-btn:hover:not\(:disabled\)\s*\{[^}]*\}/g,
    /\.page-btn\.active-page\s*\{[^}]*\}/g,
    /\.page-btn\.active\s*\{[^}]*\}/g,
    /\.page-btn:disabled\s*\{[^}]*\}/g,
    /\/\*\s*Footer and Pagination\s*\*\//g
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(cssDir);

files.forEach(file => {
    if (file.endsWith('.css') && !file.endsWith('index.css')) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;
        
        patterns.forEach(p => {
            newContent = newContent.replace(p, '');
        });
        
        newContent = newContent.replace(/\n{3,}/g, '\n\n');
        
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Cleaned up ' + file);
        }
    }
});

console.log('Done cleaning CSS files.');
