const fs = require('fs');
const path = 'd:\\work\\nishikant\\elcon-network\\elcon-frontend\\src\\Components\\Public\\Common\\PublicLayout.css';
let content = fs.readFileSync(path, 'utf8');

// Replace the spaced out CSS with proper CSS
const searchStr = ' / *   D r o p d o w n   S t y l e s   * /';
const index = content.indexOf(searchStr);

if (index !== -1) {
    const replacement = `/* Dropdown Styles */
.public-nav-dropdown {
    position: relative;
    display: inline-block;
}

.public-nav-dropdown-toggle {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
}

.dropdown-arrow {
    font-size: 10px;
}

.public-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 200px;
    background: rgba(11, 19, 43, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 100;
}

.public-nav-dropdown:hover .public-dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.public-dropdown-item {
    display: block;
    padding: 10px 20px;
    color: var(--public-text-light);
    text-decoration: none;
    font-size: 14px;
    transition: background 0.2s ease, color 0.2s ease;
}

.public-dropdown-item:hover, .public-dropdown-item.active {
    background: rgba(255, 255, 255, 0.1);
    color: var(--public-primary);
}

.public-mobile-dropdown {
    display: flex;
    flex-direction: column;
}

.public-mobile-dropdown-title {
    padding: 12px 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 1px;
}

.public-mobile-sublink {
    padding-left: 35px !important;
}
`;
    content = content.substring(0, index) + replacement;
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully fixed PublicLayout.css');
} else {
    console.log('Search string not found in PublicLayout.css');
}
