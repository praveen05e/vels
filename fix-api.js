import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix relative imports (add .js)
  content = content.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
    if (!p1.endsWith('.js') && !p1.endsWith('.json')) {
      return `from '${p1}.js'`;
    }
    return match;
  });

  // Fix req.user type error
  content = content.replace(/req\.user/g, '(req as any).user');

  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

walkDir(path.join(process.cwd(), 'api'));
console.log('Fixed API files!');
