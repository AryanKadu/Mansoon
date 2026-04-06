const fs = require('fs');
const path = require('path');
const files = [
  'routes/users.js', 'routes/cart.js', 'routes/pages.js', 'routes/home.js', 
  'routes/products.js', 'routes/admin.js', 'controllers/adminController.js', 'config/auth.js'
];
files.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace any messed up `res.redirect(http://localhost:5173/foo')` or `res.redirect('http://localhost:5173/foo')` 
    // or `res.redirect(\`http://localhost:5173/foo\`)`
    
    // First, let's normalize everything to just `res.redirect('http://localhost:5173...`
    // Find all variations of Redirect with localhost:5173
    content = content.replace(/res\.redirect\([^A-Za-z0-9]*http:\/\/localhost:5173/g, "res.redirect('http://localhost:5173");
    
    // Now replace the normalized string with backticks and env var
    content = content.replace(/res\.redirect\('http:\/\/localhost:5173([^'"`]*)[^\)]*\)/g, "res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}$1`)");

    // Also fix any res.redirect(`http://localhost:5173...`)
    content = content.replace(/res\.redirect\(`http:\/\/localhost:5173/g, "res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}");

    fs.writeFileSync(p, content);
  }
});
console.log('Done mapping urls.');
