import fs from 'node:fs'
import path from 'node:path'

// =============================================================================
// Envoi de campagnes e-mail aux clients via Resend (v2, multi-campagnes).
//
// Usage :
//   Preview (aucun envoi) : node scripts/send-campaign.mjs --campaign=<id> --subject="..."
//   Test sur une adresse  : ... --campaign=<id> --subject="..." --test=adresse@domaine.fr
//   Campagne complète     : ... --campaign=<id> --subject="..." --send-all
//
// Un journal par campagne (scripts/campaign_logs/<id>.json) permet d'envoyer
// plusieurs campagnes à la même base sans doublon au sein d'une campagne.
// Conformité : en-têtes List-Unsubscribe + lien de désinscription visible dans
// chaque e-mail. Aucune remise ni incitation à consommer (CSP art. L3513-4) :
// informations, nouveautés et conseils uniquement.
// =============================================================================

const SENDER = 'THEKLOPE <contact@theklope.com>'
const REPLY_TO = 'contact@theklope.com'
const CSV_PATH = path.resolve('clients_theklope_clean.csv')

let resendApiKey = process.env.RESEND_API_KEY
for (const envFile of ['.env.local', '.env']) {
  if (!resendApiKey && fs.existsSync(envFile)) {
    const match = fs.readFileSync(envFile, 'utf8').match(/RESEND_API_KEY=["']?([^"'\r\n]+)["']?/)
    if (match) resendApiKey = match[1]
  }
}

async function main() {
  const args = process.argv.slice(2)
  const getArg = (name) => {
    const hit = args.find((a) => a.startsWith(`--${name}=`))
    return hit ? hit.split('=').slice(1).join('=') : null
  }
  const campaign = getArg('campaign')
  const subject = getArg('subject')
  const htmlArg = getArg('html')
  const testEmail = getArg('test')
  const isSendAll = args.includes('--send-all')

  if (!campaign) {
    console.error('❌ Indiquez un id de campagne : --campaign=reactivation-2026-11')
    if (fs.existsSync('scripts/campaign_logs')) {
      console.log('   Campagnes existantes :', fs.readdirSync('scripts/campaign_logs').map((f) => f.replace('.json', '')).join(', '))
    }
    process.exit(1)
  }
  const htmlPath = htmlArg || path.resolve(`scripts/email-campaign-${campaign}.html`)
  if (!subject) { console.error("❌ --subject=\"<objet de l'e-mail>\" requis"); process.exit(1) }
  if (!fs.existsSync(htmlPath)) { console.error('❌ Modèle HTML introuvable :', htmlPath); process.exit(1) }
  if (!fs.existsSync(CSV_PATH)) { console.error('❌ CSV destinataires introuvable :', CSV_PATH); process.exit(1) }
  if (!resendApiKey) { console.error('❌ Clé RESEND_API_KEY non configurée.'); process.exit(1) }

  const htmlContent = fs.readFileSync(htmlPath, 'utf8')
  const logDir = path.resolve('scripts/campaign_logs')
  fs.mkdirSync(logDir, { recursive: true })
  const logPath = path.resolve(logDir, `${campaign}.json`)
  let sentLog = {}
  if (fs.existsSync(logPath)) { try { sentLog = JSON.parse(fs.readFileSync(logPath, 'utf8')) } catch { sentLog = {} } }

  const csvLines = fs.readFileSync(CSV_PATH, 'utf8')
    .split('\n').map((l) => l.trim().toLowerCase())
    .filter((l) => l && l !== 'email' && l.includes('@'))
  const pending = csvLines.filter((email) => !sentLog[email])
  console.log(`=== CAMPAGNE « ${campaign} » ===`)
  console.log(`📊 Base : ${csvLines.length} clients | déjà envoyés (cette campagne) : ${Object.keys(sentLog).length} | restants : ${pending.length}`)
  console.log(`Objet : ${subject}`)

  const headers = {
    'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=Désinscription%20${encodeURIComponent(campaign)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }

  // Mode test : envoi unique, hors journal de campagne.
  if (testEmail) {
    console.log(`\n📬 Test vers ${testEmail} (hors journal)`)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDER, to: [testEmail], reply_to: REPLY_TO, subject: `[TEST] ${subject}`, html: htmlContent, headers }),
    })
    const data = await res.json()
    console.log(res.ok ? `✅ Test envoyé (ID ${data.id})` : `❌ Erreur : ${JSON.stringify(data)}`)
    return
  }

  if (!isSendAll) {
    console.log('\n⚠️  MODE PREVIEW (aucun envoi réel).')
    console.log('👉 Test  : node scripts/send-campaign.mjs --campaign=<id> --subject="..." --test=adresse')
    console.log('👉 Envoi : node scripts/send-campaign.mjs --campaign=<id> --subject="..." --send-all')
    return
  }

  if (pending.length === 0) {
    console.log('🎉 Campagne déjà envoyée à toute la base.')
    return
  }

  console.log(`\n🚀 Envoi vers ${pending.length} clients...`)
  const BATCH_SIZE = 50
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE)
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(batch.map((email) => ({
          from: SENDER, to: [email], reply_to: REPLY_TO, subject, html: htmlContent, headers,
        }))),
      })
      const data = await res.json()
      if (!res.ok || !data.data) throw new Error(JSON.stringify(data).slice(0, 300))
      batch.forEach((email, index) => { sentLog[email] = { id: data.data[index]?.id || 'sent', sentAt: new Date().toISOString() } })
      fs.writeFileSync(logPath, JSON.stringify(sentLog, null, 2))
      console.log(`[${Math.min(i + batch.length, pending.length)}/${pending.length}] batch envoyé`)
    } catch (err) {
      console.error(`❌ Batch ${i} échoué :`, err.message)
      await new Promise((r) => setTimeout(r, 3000))
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  console.log('\n🎉 Campagne terminée.')
}

main()
