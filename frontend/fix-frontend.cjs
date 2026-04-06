const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Check if file has "http://localhost:8000"
    if (content.includes("http://localhost:8000") || content.includes("const API = 'http://localhost:8000'")) {
       content = content.replace(/const API = 'http:\/\/localhost:8000'/g, "import { config } from '../config';\nconst API = config.API_URL;");
       // In AuthContext it might be in src/context hence path is '../config' or '../../config'?
       // For a robust way, let's just make it replace `http://localhost:8000` directly if it's inline
       content = content.replace(/'http:\/\/localhost:8000(\/[^']*)'/g, "`${config.API_URL}$1`");
       changed = true;
    }

    if (content.includes("RAZORPAY_KEY = 'rzp_test_RDvTNdCW0hJo6D'")) {
       content = content.replace(/const RAZORPAY_KEY = 'rzp_test_RDvTNdCW0hJo6D'/g, "const RAZORPAY_KEY = config.RAZORPAY_KEY;");
       changed = true;
    }

    // Add import statement if we replaced something but it's not imported
    if (changed && !content.includes("config.API_URL") && content.includes("config.RAZORPAY_KEY")) {
        // Find how many dot-dots we need based on path depth
        const depth = filePath.split(path.sep).length - path.join(__dirname, 'src').split(path.sep).length;
        const traverse = depth === 1 ? './' : '../'.repeat(depth - 1);
        content = `import { config } from '${traverse}config';\n` + content;
    } else if (changed && !content.includes("import { config }")) {
        const depth = filePath.split(path.sep).length - path.join(__dirname, 'src').split(path.sep).length;
        const traverse = depth === 1 ? './' : '../'.repeat(depth - 1);
        content = `import { config } from '${traverse}config';\n` + content;
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed ' + filePath);
    }
  }
});
