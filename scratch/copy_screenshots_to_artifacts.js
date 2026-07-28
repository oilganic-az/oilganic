import fs from 'node:fs';
import path from 'node:path';

const srcDir = 'public/screenshots';
const destDir = 'C:\\Users\\Huawei\\.gemini\\antigravity-ide\\brain\\3b82f03c-33f7-4d24-be6d-2797e36cb2c0';

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    if (file.endsWith('.png')) {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    }
  });
  console.log(`Copied ${files.length} screenshot files to artifacts directory.`);
}
