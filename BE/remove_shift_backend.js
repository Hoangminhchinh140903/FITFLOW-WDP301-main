const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove the require statement
  content = content.replace(/const\s+\{\s*requireActiveShiftForStaff\s*\}\s*=\s*require\('\.\.\/middleware\/activeShift\.middleware'\);\n?/g, '');
  
  // Remove the function usage with comma
  content = content.replace(/requireActiveShiftForStaff\s*,\s*/g, '');
  // Remove the function usage without comma
  content = content.replace(/requireActiveShiftForStaff/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}

// Remove the activeShift.middleware.js file
const middlewareFile = path.join(__dirname, 'middleware', 'activeShift.middleware.js');
if (fs.existsSync(middlewareFile)) {
  fs.unlinkSync(middlewareFile);
  console.log('Deleted activeShift.middleware.js');
}

// Remove from importData.js
const importDataPath = path.join(__dirname, 'scripts', 'importData.js');
if (fs.existsSync(importDataPath)) {
  let importContent = fs.readFileSync(importDataPath, 'utf8');
  let importOriginal = importContent;
  
  importContent = importContent.replace(/\s*'shifts\.json':\s*'shifts',/g, '');
  importContent = importContent.replace(/\s*'shifts\.json':\s*\([^)]*\)\s*=>\s*\{[^}]*\},/g, '');
  // specifically look at lines 36
  importContent = importContent.replace(/\s*'shifts\.json':\s*\(docs\)\s*=>\s*\{[\s\S]*?\},/g, '');
  
  if (importContent !== importOriginal) {
    fs.writeFileSync(importDataPath, importContent);
    console.log('Updated importData.js');
  }
}

console.log('Backend shift removal complete.');
