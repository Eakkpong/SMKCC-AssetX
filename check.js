const fs = require('fs');
const https = require('https');
const html = fs.readFileSync('vercel_html.txt', 'utf8');
const jsFiles = [...html.matchAll(/src=\"(\/_next\/static\/chunks\/.*?\.js)\"/g)].map(m => m[1]);
console.log('Found JS files:', jsFiles.length);

let foundNew = false;
let foundOld = false;

Promise.all(jsFiles.map(file => {
  return new Promise((resolve) => {
    https.get('https://smkcc-asset-x.vercel.app' + file, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes('ใบยืมพัสดุ - ครุภัณฑ์') || data.includes('กชนิภา')) foundNew = true;
        if (data.includes('Paperless')) foundOld = true;
        resolve();
      });
    }).on('error', resolve);
  });
})).then(() => {
  console.log('Old version strings found:', foundOld);
  console.log('New version strings found:', foundNew);
});
