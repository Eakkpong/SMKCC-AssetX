const fs = require('fs');
const https = require('https');
https.get('https://smkcc-asset-x.vercel.app/kiosk/sign/1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const jsFiles = [...data.matchAll(/src=\"(\/_next\/static\/chunks\/.*?\.js)\"/g)].map(m => m[1]);
    console.log('Found JS files:', jsFiles.length);

    let foundOldName = false;
    let foundNewName = false;

    Promise.all(jsFiles.map(file => {
      return new Promise((resolve) => {
        https.get('https://smkcc-asset-x.vercel.app' + file, (res) => {
          let jsData = '';
          res.on('data', chunk => jsData += chunk);
          res.on('end', () => {
            if (jsData.includes('นางสาวพรพรรณ')) foundOldName = true;
            if (jsData.includes('นางสาวกชนิภา')) foundNewName = true;
            resolve();
          });
        }).on('error', resolve);
      });
    })).then(() => {
      console.log('Old name found:', foundOldName);
      console.log('New name found:', foundNewName);
    });
  });
});
