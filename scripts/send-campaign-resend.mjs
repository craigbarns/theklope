import fs from 'node:fs'
import path from 'node:path'

// Configuration
const SENDER = 'THEKLOPE <contact@theklope.com>'
const SUBJECT = '🎉 Bienvenue sur le nouveau site THEKLOPE ! -15% & Offres e-liquides'
const CSV_PATH = path.resolve('clients_theklope_clean.csv')
const HTML_PATH = path.resolve('scripts/email-campaign-nouveau-site.html')
const LOG_PATH = path.resolve('scripts/campaign_sent_log.json')

// Récupération de la clé API Resend depuis l'environnement ou .env.local
let resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  const match = envContent.match(/RESEND_API_KEY=["']?([^"'\r\n]+)["']?/)
  if (match) resendApiKey = match[1]
}

if (!resendApiKey && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8')
  const match = envContent.match(/RESEND_API_KEY=["']?([^"'\r\n]+)["']?/)
  if (match) resendApiKey = match[1]
}

async function main() {
  const args = process.argv.slice(2)
  const isTest = args.find((a) => a.startsWith('--test='))
  const testEmail = isTest ? isTest.split('=')[1] : null
  const isSendAll = args.includes('--send-all')

  console.log('=== CAMPAIGN SENDER RESEND — THEKLOPE ===')

  if (!fs.existsSync(HTML_PATH)) {
    console.error('❌ Modèle HTML introuvable :', HTML_PATH)
    process.exit(1)
  }

  const htmlContent = fs.readFileSync(HTML_PATH, 'utf8')

  if (!resendApiKey) {
    console.error('❌ Clé RESEND_API_KEY non configurée !')
    console.log('👉 Fournissez la clé via : RESEND_API_KEY="re_..." node scripts/send-campaign-resend.mjs')
    process.exit(1)
  }

  // 1. Mode E-mail de test
  if (testEmail) {
    console.log(`\n📬 Envoi d'un e-mail de TEST à : ${testEmail}`)
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: SENDER,
          to: [testEmail],
          subject: `[TEST] ${SUBJECT}`,
          html: htmlContent,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        console.log('✅ E-mail de test envoyé avec succès ! ID Resend :', data.id)
      } else {
        console.error('❌ Erreur Resend :', data)
      }
    } catch (err) {
      console.error('❌ Exception lors de l’envoi de test :', err.message)
    }
    return
  }

  // 2. Chargement des destinataires
  if (!fs.existsSync(CSV_PATH)) {
    console.error('❌ Fichier CSV des destinataires introuvable :', CSV_PATH)
    process.exit(1)
  }

  const csvLines = fs
    .readFileSync(CSV_PATH, 'utf8')
    .split('\n')
    .map((l) => l.trim().toLowerCase())
    .filter((l) => l && l !== 'email' && l.includes('@'))

  const totalRecipients = csvLines.length
  console.log(`📊 Destinataires chargés : ${totalRecipients} clients`)

  // Chargement du journal des envois déjà effectués
  let sentLog = {}
  if (fs.existsSync(LOG_PATH)) {
    try {
      sentLog = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'))
    } catch {
      sentLog = {}
    }
  }

  const pendingRecipients = csvLines.filter((email) => !sentLog[email])
  console.log(`✅ Déjà envoyés : ${Object.keys(sentLog).length}`)
  console.log(`⏳ Reste à envoyer : ${pendingRecipients.length}`)

  if (!isSendAll) {
    console.log('\n⚠️  MODE PREVIEW (aucun e-mail réel envoyé).')
    console.log('👉 Pour envoyer un TEST : node scripts/send-campaign-resend.mjs --test=votre-email@domaine.com')
    console.log('👉 Pour envoyer la CAMPAGNE COMPLÈTE : node scripts/send-campaign-resend.mjs --send-all')
    return
  }

  if (pendingRecipients.length === 0) {
    console.log('🎉 Tous les e-mails de la liste ont déjà été envoyés !')
    return
  }

  console.log(`\n🚀 Démarrage de l'envoi vers ${pendingRecipients.length} clients...`)

  // Traitement par lots (batch size 100 via API batch de Resend)
  const BATCH_SIZE = 50
  for (let i = 0; i < pendingRecipients.length; i += BATCH_SIZE) {
    const batch = pendingRecipients.slice(i, i + BATCH_SIZE)
    const payload = batch.map((email) => ({
      from: SENDER,
      to: [email],
      subject: SUBJECT,
      html: htmlContent,
    }))

    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.data) {
        batch.forEach((email, index) => {
          sentLog[email] = {
            id: data.data[index]?.id || 'sent',
            sentAt: new Date().toISOString(),
          }
        })
        fs.writeFileSync(LOG_PATH, JSON.stringify(sentLog, null, 2))
        console.log(`[${i + batch.length}/${pendingRecipients.length}] Batch de ${batch.length} e-mails envoyé avec succès.`)
      } else {
        console.error(`❌ Erreur sur le batch [${i}-${i + BATCH_SIZE}] :`, data)
        // Attente 2s avant de retenter
        await new Promise((r) => setTimeout(r, 2000))
      }
    } catch (err) {
      console.error(`❌ Erreur réseau batch :`, err.message)
      await new Promise((r) => setTimeout(r, 3000))
    }

    // Pause de 500ms entre les lots pour respecter les limites de rate Resend
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log('\n🎉 Campagne terminée avec succès !')
}

main()
