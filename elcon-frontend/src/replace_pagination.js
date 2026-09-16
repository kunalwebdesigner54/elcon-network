const fs = require('fs');
const path = require('path');

const frontendSrc = path.join(__dirname);

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;

    // 1. Replace dropdown 10, 25, 50 with 10, 50, 100
    const optionPattern = /<option\s+value="10"\s*>10<\/option>\s*<option\s+value="25"\s*>25<\/option>\s*<option\s+value="50"\s*>50<\/option>/g;
    content = content.replace(optionPattern, '<option value="10">10</option>\n                <option value="50">50</option>\n                <option value="100">100</option>');
    
    // Also cover single quote variations if any
    const optionPattern2 = /<option\s+value='10'\s*>10<\/option>\s*<option\s+value='25'\s*>25<\/option>\s*<option\s+value='50'\s*>50<\/option>/g;
    content = content.replace(optionPattern2, '<option value="10">10</option>\n                <option value="50">50</option>\n                <option value="100">100</option>');

    // 2. Pagination replace: replace everything inside <div className="pagination">...</div>
    // Note: since JSX can have nested divs, we assume the pagination div has no nested divs, just buttons and maybe arrays.
    // It's safer to use a regex that matches `<div className="pagination">` until `</div>`
    
    const paginationDivPattern = /<div\s+className="pagination"\s*>([\s\S]*?)<\/div>/g;
    
    content = content.replace(paginationDivPattern, (match, inner) => {
        // determine if it uses `currentPage` or `page`
        const usesCurrentPage = inner.includes('currentPage');
        const varName = usesCurrentPage ? 'currentPage' : 'page';
        
        // determine if it uses `handlePageChange`
        // almost all use `handlePageChange(xxx)`
        
        return `<div className="pagination">
                <button className="page-btn" onClick={() => handlePageChange(1)} disabled={${varName} === 1}>&lt;&lt;</button>
                <button className="page-btn" onClick={() => handlePageChange(${varName} - 1)} disabled={${varName} === 1}>Prev</button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  let s = Math.max(1, ${varName} - 1);
                  let e = Math.min(totalPages, s + 2);
                  if (e - s < 2) s = Math.max(1, e - 2);
                  if (p < s || p > e) return null;
                  return (
                    <button 
                      key={p} 
                      className={\`page-btn \${${varName} === p ? 'active' : ''}\`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => handlePageChange(${varName} + 1)} disabled={${varName} === totalPages}>Next</button>
                <button className="page-btn" onClick={() => handlePageChange(totalPages)} disabled={${varName} === totalPages}>&gt;&gt;</button>
              </div>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated ${filepath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(frontendSrc);
console.log("Done.");
