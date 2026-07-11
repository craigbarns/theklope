import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dist = resolve(root, 'dist')

// Client-side routes that are valid but not pre-rendered
const clientSideRoutes = [
  '/checkout',
  '/checkout/retour',
  '/favoris',
  '/admin'
]

// Recursively get all HTML files in dist/
function getHtmlFiles(dir, filesList = []) {
  const files = readdirSync(dir)
  for (const file of files) {
    const name = join(dir, file)
    if (statSync(name).isDirectory()) {
      getHtmlFiles(name, filesList)
    } else if (file.endsWith('.html')) {
      filesList.push(name)
    }
  }
  return filesList
}

const htmlFiles = getHtmlFiles(dist)
const brokenLinks = []
let totalLinksChecked = 0

for (const file of htmlFiles) {
  const relativeFile = file.replace(dist, '')
  const content = readFileSync(file, 'utf8')
  
  // Simple regex to find href="..."
  const hrefRegex = /href="([^"]+)"/g
  let match
  
  while ((match = hrefRegex.exec(content)) !== null) {
    const rawHref = match[1]
    
    // Ignore external, tel, mailto, anchor only links
    if (
      rawHref.startsWith('http') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('#') ||
      rawHref.startsWith('//')
    ) {
      continue
    }
    
    totalLinksChecked++
    
    // Remove query params and hash anchors
    const cleanHref = rawHref.split('?')[0].split('#')[0]
    
    // Check if it's a client-side route
    if (clientSideRoutes.includes(cleanHref)) {
      continue
    }
    
    // Convert href to path in dist/
    const targetPath = cleanHref === '/' || cleanHref === '' 
      ? resolve(dist, 'index.html')
      : resolve(dist, cleanHref.replace(/^\//, ''), 'index.html')
      
    if (!existsSync(targetPath)) {
      // Check if it's a direct asset
      const assetPath = resolve(dist, cleanHref.replace(/^\//, ''))
      if (!existsSync(assetPath)) {
        brokenLinks.push({
          sourceFile: relativeFile,
          href: rawHref,
          cleanHref
        })
      }
    }
  }
}

console.log(`Crawl result: Checked ${totalLinksChecked} links.`)
if (brokenLinks.length > 0) {
  console.error(`Found ${brokenLinks.length} broken links:`)
  console.table(brokenLinks)
  process.exit(1)
} else {
  console.log('✓ All internal links are valid and exist in dist/!')
  process.exit(0)
}
