import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Simulation de l'import des produits 
const productsFile = fs.readFileSync('src/data/products.js', 'utf-8');
// Extraction basique des IDs et noms avec une regex
const products = [];
const regex = /"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(productsFile)) !== null) {
  products.push({ id: match[1], name: match[2].toLowerCase() });
}

const pagesCsv = fs.readFileSync('/Users/gregorybaranes/Downloads/theklope-3/Pages.csv', 'utf-8');
const htmlLines = pagesCsv.split('\n').filter(l => l.includes('.html'));

const redirects = [];
let notFound = [];

function simplifyString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

for (const line of htmlLines) {
  const url = line.split(',')[0].trim();
  const path = url.replace('https://www.theklope.com', '').replace('https://theklope.com', '');
  
  if (!path.includes('.html')) continue;
  
  // Extraire les mots-clés de l'ancienne URL (ex: /kits-complets/409-geekvape-digi-max.html)
  const filename = path.split('/').pop().replace('.html', '');
  // Retirer l'ID de l'ancien site (ex: 409-)
  const keywords = filename.replace(/^\d+-/, '').split('-');
  
  let bestMatch = null;
  let maxScore = 0;
  
  for (const product of products) {
    let score = 0;
    for (const kw of keywords) {
      if (kw.length < 3) continue; // ignorer les petits mots
      if (product.id.includes(kw) || product.name.includes(kw)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = product;
    }
  }
  
  if (bestMatch && maxScore > 0) {
    redirects.push(`    { "source": "${path}", "destination": "/produit/${bestMatch.id}", "permanent": true },`);
  } else {
    notFound.push(path);
  }
}

console.log('✅ NOUVELLES REDIRECTIONS 301 GÉNÉRÉES :\n');
console.log(redirects.join('\n'));

console.log(`\n\n⚠️ ${notFound.length} URLs n'ont pas trouvé de correspondance exacte (redirection vers /boutique par défaut).`);
