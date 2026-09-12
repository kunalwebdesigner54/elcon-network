const fs = require('fs');
const path = require('path');

const cssDir = 'd:/work/nishikant/elcon-network/elcon-frontend/src';

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
let changedCount = 0;

files.forEach(file => {
    if (file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;
        
        // 1. Remove inline styles from <div className="pagination"...
        // e.g. <div className="pagination" style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        newContent = newContent.replace(/<div className="pagination" style=\{[^}]+\}>/g, '<div className="pagination">');
        newContent = newContent.replace(/<div className="pagination" style=\{\{.*?\}\}>/g, '<div className="pagination">');
        
        // 2. Wrap "Total Entries :" if it's not wrapped in table-footer
        // Actually, replacing all exact matches of 'Total Entries :' might be complex if it's scattered.
        // Let's just fix the pagination inline styles first.
        
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Cleaned up ' + file);
            changedCount++;
        }
    }
});

console.log('Done cleaning JSX files. Changed: ' + changedCount);
