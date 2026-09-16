import os
import re

frontend_src = r'd:\work\nishikant\elcon-network\elcon-frontend\src'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # 1. Replace dropdown 10, 25, 50 with 10, 50, 100
    # Search for exactly this sequence of options:
    # <option value="10">10</option>
    # <option value="25">25</option>
    # <option value="50">50</option>
    
    # Pattern to match the three options, ignoring whitespace
    pattern_options = r'(<option\s+value="10"\s*>10</option>)\s*(<option\s+value="25"\s*>25</option>)\s*(<option\s+value="50"\s*>50</option>)'
    
    def repl_options(m):
        return '<option value="10">10</option>\n                <option value="50">50</option>\n                <option value="100">100</option>'
        
    content = re.sub(pattern_options, repl_options, content)

    # 2. Replace pagination block
    # Most pagination blocks look like:
    # {[...Array(totalPages)].map((_, i) => (
    #   <button 
    #     key={i + 1} 
    #     className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
    #     onClick={() => handlePageChange(i + 1)}
    #   >
    #     {i + 1}
    #   </button>
    # ))}
    
    # We will replace `{[...Array(totalPages)].map((_, i) => (` with:
    # {[...Array(totalPages)].map((_, i) => {
    #   const p = i + 1;
    #   let s = Math.max(1, currentPage - 1);
    #   let e = Math.min(totalPages, s + 2);
    #   if (e - s < 2) s = Math.max(1, e - 2);
    #   if (p < s || p > e) return null;
    #   return (

    pattern_map = r'\{\[\.\.\.Array\(totalPages\)\]\.map\(\(\_,\s*i\)\s*=>\s*\('
    
    repl_map = '''{[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  let s = Math.max(1, currentPage - 1);
                  let e = Math.min(totalPages, s + 2);
                  if (e - s < 2) s = Math.max(1, e - 2);
                  if (p < s || p > e) return null;
                  return ('''
                  
    # But wait, we also need to change the closing `))` to `)})` for the map function.
    # It's safer to just regex replace the entire block of `{[...Array(totalPages)].map ... )}`
    
    # Let's match the entire block
    pattern_full_map1 = r'\{\[\.\.\.Array\(totalPages\)\]\.map\(\(\_,\s*i\)\s*=>\s*\(\s*<button\s+key=\{i\s*\+\s*1\}\s+className=\{`page-btn\s+\$\{currentPage\s*===\s*i\s*\+\s*1\s*\?\s*\'active\'\s*:\s*\'\'\}`\}\s+onClick=\{\(\)\s*=>\s*handlePageChange\(i\s*\+\s*1\)\}\s*>\s*\{i\s*\+\s*1\}\s*</button>\s*\)\)\}'
    
    repl_full_map1 = '''{[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  let s = Math.max(1, currentPage - 1);
                  let e = Math.min(totalPages, s + 2);
                  if (e - s < 2) s = Math.max(1, e - 2);
                  if (p < s || p > e) return null;
                  return (
                    <button 
                      key={p} 
                      className={`page-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}'''

    content = re.sub(pattern_full_map1, repl_full_map1, content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(frontend_src):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
