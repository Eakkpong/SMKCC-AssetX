const fs = require('fs');
const img = fs.readFileSync('public/logo.png');
const b64 = img.toString('base64');
fs.writeFileSync('src/lib/logoBase64.ts', `export const logoBase64 = "${b64}";`);
console.log('Done');
