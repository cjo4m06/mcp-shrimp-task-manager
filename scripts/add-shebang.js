import fs from 'fs';

const filePath = './dist/index.js';
const shebang = '#!/usr/bin/env node\n';

let content = fs.readFileSync(filePath, 'utf8');
if (!content.startsWith(shebang)) {
  content = shebang + content;
  fs.writeFileSync(filePath, content);
  console.log('✅ Shebang added to dist/index.js');
} else {
  console.log('ℹ️ Shebang already present.');
}
