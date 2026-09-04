import fs from 'fs';

const vercelStr = fs.readFileSync('vercel.json', 'utf-8');
const vercelObj = JSON.parse(vercelStr);

const redirectsLines = fs.readFileSync('redirects.txt', 'utf-8').split('\n').filter(Boolean);

const newRedirects = redirectsLines.map(line => {
  const match = line.match(/"source": "([^"]+)", "destination": "([^"]+)"/);
  if (match) {
    return { source: match[1], destination: match[2], permanent: true };
  }
  return null;
}).filter(Boolean);

// Filtrer les doublons
const existingSources = new Set(vercelObj.redirects.map(r => r.source));

for (const r of newRedirects) {
  if (!existingSources.has(r.source)) {
    // Insérer avant le catch-all /:path*.html
    const catchAllIndex = vercelObj.redirects.findIndex(x => x.source === '/:path*.html');
    if (catchAllIndex !== -1) {
      vercelObj.redirects.splice(catchAllIndex, 0, r);
    } else {
      vercelObj.redirects.push(r);
    }
    existingSources.add(r.source);
  }
}

fs.writeFileSync('vercel.json', JSON.stringify(vercelObj, null, 2));
console.log('✅ vercel.json mis à jour avec les redirections.');
