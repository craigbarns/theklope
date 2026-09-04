import https from 'https';
const req = https.get('https://html.duckduckgo.com/html/?q=blog+vape+france', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const urls = data.match(/<a class="result__url" href="([^"]+)">/g) || [];
    console.log(urls);
  });
});
