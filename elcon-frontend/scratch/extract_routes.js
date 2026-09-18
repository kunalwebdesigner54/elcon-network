const fs = require('fs');

function extractRoutes() {
  const content = fs.readFileSync('src/App.jsx', 'utf8');
  
  const pathRegex = /<Route\s+path=["']([^"']+)["']/g;
  const routes = [];
  
  let match;
  while ((match = pathRegex.exec(content)) !== null) {
    let path = match[1];
    routes.push(path);
  }
  
  // also look for index routes
  // e.g. <Route index element={<... />} /> -> we don't have the path here, but it inherits from parent.
  // Actually, App.jsx has nested routes. We should reconstruct them!
  // But a simple regex on path="" gives us the relative path. If they are nested, they might be partial.
  // Let's just do a more complete parser or just read the ones that start with "/"
  
  fs.writeFileSync('scratch/extracted_routes.json', JSON.stringify([...new Set(routes)], null, 2));
  console.log(`Extracted ${new Set(routes).size} unique routes`);
}

extractRoutes();
