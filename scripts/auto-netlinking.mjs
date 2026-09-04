import https from 'https';
import http from 'http';
import fs from 'fs';

// Configuration
const QUERIES = [
  "blog cigarette electronique france",
  "blog sevrage tabagique",
  "magazine vape france",
  "articles de blog e-liquide"
];

const PATHS_TO_CHECK = ['', '/contact', '/a-propos', '/mentions-legales', '/contactez-nous', '/about'];
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Chercher les URLs via DuckDuckGo HTML
async function searchDDG(query) {
  console.log(`\n🔎 Recherche de blogs pour : "${query}"`);
  return new Promise((resolve) => {
    const encodedQuery = encodeURIComponent(query);
    const req = https.get(`https://html.duckduckgo.com/html/?q=${encodedQuery}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const rawLinks = data.match(/uddg=([^&]+)/g) || [];
        const decodedUrls = rawLinks.map(l => decodeURIComponent(l.replace('uddg=', '')));
        // Ne garder que le domaine (racine) pour la prospection
        const domains = [...new Set(decodedUrls.map(u => {
          try { return new URL(u).origin; } catch(e) { return null; }
        }).filter(Boolean))];
        resolve(domains.slice(0, 10)); // Top 10 domaines uniques par requête
      });
    });
    req.on('error', () => resolve([]));
  });
}

// 2. Extraire le HTML d'une page
async function fetchHtml(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 3000 
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          try { redirectUrl = new URL(redirectUrl, url).href; } catch(e) {}
        }
        return resolve(fetchHtml(redirectUrl));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

// 3. Crawler les domaines pour les emails
async function extractEmailsFromDomain(domain) {
  let allEmails = new Set();
  
  for (const path of PATHS_TO_CHECK) {
    const targetUrl = `${domain}${path}`;
    const html = await fetchHtml(targetUrl);
    const emails = html.match(emailRegex) || [];
    
    emails.filter(e => 
      !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.webp') && 
      !e.endsWith('.gif') && !e.includes('sentry') && !e.includes('wix') &&
      !e.includes('@example.com')
    ).map(e => e.toLowerCase()).forEach(e => allEmails.add(e));
  }
  return Array.from(allEmails);
}

// 4. Orchestration
async function runAutoNetlinking() {
  console.log('🤖 Démarrage de l\'Agent Auto-Netlinking SEO...\n');
  
  let allDomains = new Set();
  for (const query of QUERIES) {
    const domains = await searchDDG(query);
    domains.forEach(d => allDomains.add(d));
    await sleep(2000); // Respecter les serveurs DDG
  }

  const prospects = Array.from(allDomains);
  console.log(`\n🎯 ${prospects.length} blogs/médias trouvés. Début de l'extraction des emails...`);
  
  let csvContent = 'Domaine,Emails\n';
  let successCount = 0;

  for (const domain of prospects) {
    process.stdout.write(`Extrait ${domain}... `);
    const emails = await extractEmailsFromDomain(domain);
    
    if (emails.length > 0) {
      process.stdout.write(`\x1b[32m${emails.length} emails trouvés !\x1b[0m\n`);
      csvContent += `${domain},"${emails.join(', ')}"\n`;
      successCount++;
    } else {
      process.stdout.write(`❌\n`);
    }
  }

  fs.writeFileSync('prospects-netlinking.csv', csvContent);
  console.log(`\n✅ Terminé ! Un fichier 'prospects-netlinking.csv' a été généré avec ${successCount} cibles hautement qualifiées.`);
}

runAutoNetlinking();
