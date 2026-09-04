import https from 'https';
import http from 'http';

// Liste de vos prospects pour obtenir des backlinks (blogs, magazines vape, sites santé)
const URLS_TO_SCAN = [
  'https://fr.vapingpost.com',
  'https://www.breakingvap.fr',
  'https://www.aromes-et-liquides.fr',
  'https://vapest.fr',
  'https://www.youvape.fr',
  'https://www.cigusto.com',
  'https://www.blu.com',
  'https://vap-expert.fr',
  'https://www.nicovip.com',
  'https://www.vapyou.com'
];

// Pages classiques où se cachent les emails
const PATHS_TO_CHECK = ['', '/contact', '/a-propos', '/mentions-legales', '/contactez-nous', '/about'];

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Fonction pour récupérer le HTML d'une page (avec un faux User-Agent pour éviter les blocages basiques)
async function fetchHtml(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout: 5000 
    }, (res) => {
      // Gérer les redirections basiques si nécessaire
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const baseUrl = new URL(url);
          redirectUrl = `${baseUrl.origin}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`;
        }
        return resolve(fetchHtml(redirectUrl));
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', () => resolve('')); // On ignore silencieusement les erreurs de connexion pour ne pas bloquer le script
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

async function scanUrls() {
  console.log('🔍 Début du scan approfondi de prospection Netlinking...\n');
  
  for (const baseUrl of URLS_TO_SCAN) {
    console.log(`🌐 Analyse du domaine : ${baseUrl}...`);
    let allEmails = new Set();
    
    // On nettoie l'URL de base pour enlever le slash final éventuel
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // Scan de la page d'accueil + des pages de contact
    for (const path of PATHS_TO_CHECK) {
      const targetUrl = `${cleanBaseUrl}${path}`;
      process.stdout.write(`  ├─ Check ${path || '/ (accueil)'}... `);
      
      const html = await fetchHtml(targetUrl);
      const emails = html.match(emailRegex) || [];
      
      // Filtrage des faux positifs (images, librairies javascript, adresses type wix)
      const validEmails = emails.filter(e => 
        !e.endsWith('.png') && 
        !e.endsWith('.jpg') && 
        !e.endsWith('.webp') && 
        !e.endsWith('.gif') && 
        !e.includes('sentry') && 
        !e.includes('wixpress') &&
        !e.includes('@example.com')
      ).map(e => e.toLowerCase());

      validEmails.forEach(e => allEmails.add(e));
      
      if (validEmails.length > 0) {
        process.stdout.write(`✅ Trouvé !\n`);
      } else {
        process.stdout.write(`❌\n`);
      }
    }

    if (allEmails.size > 0) {
      console.log(`  └─ 🎯 BINGO ! Emails extraits : \x1b[32m${Array.from(allEmails).join(', ')}\x1b[0m\n`);
    } else {
      console.log(`  └─ ⚠️ Aucun email trouvé. Probablement caché derrière un formulaire.\n`);
    }
  }
  
  console.log('💡 Conseil SEO : Exportez ces emails en CSV pour votre logiciel d\'outreach (Lemlist, Woodpecker...).');
}

scanUrls();
