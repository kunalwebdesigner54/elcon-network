import os
import re

css_dir = 'd:/work/nishikant/elcon-network/elcon-frontend/src'

# Regex to match these CSS blocks and anything inside them
patterns = [
    r'\.table-footer\s*\{[^}]*\}',
    r'\.total-entries\s*\{[^}]*\}',
    r'\.pagination\s*\{[^}]*\}',
    r'\.page-btn\s*\{[^}]*\}',
    r'\.page-btn:hover\s*\{[^}]*\}',
    r'\.page-btn:hover:not\(:disabled\)\s*\{[^}]*\}',
    r'\.page-btn\.active-page\s*\{[^}]*\}',
    r'\.page-btn:disabled\s*\{[^}]*\}',
    r'\/\*\s*Footer and Pagination\s*\*\/'
]

for root, dirs, files in os.walk(css_dir):
    for file in files:
        if file.endswith('.css') and file != 'index.css':
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for p in patterns:
                new_content = re.sub(p, '', new_content, flags=re.MULTILINE)
            
            # Remove any extra blank lines left over
            new_content = re.sub(r'\n{3,}', '\n\n', new_content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Cleaned up {file_path}')

print('Done cleaning CSS files.')
