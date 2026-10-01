// =============================================================================
// Colissimo — création d'étiquettes via le Web Service SLS (REST v2).
// -----------------------------------------------------------------------------
// Variables d'environnement (Vercel, jamais dans le code) :
//   COLISSIMO_CONTRACT_NUMBER  numéro de contrat / identifiant Colissimo
//   COLISSIMO_PASSWORD         mot de passe de l'espace Colissimo Entreprise
//   COLISSIMO_PRODUCT_CODE     optionnel, « DOS » (remise contre signature) par
//                              défaut, choix du gérant ; « DOM » pour sans signature
//
// L'API renvoie une réponse multipart : une partie JSON (numéro de colis,
// messages) puis le PDF de l'étiquette en binaire.
// =============================================================================
import { STORE_PHONE } from '../../src/data/localBusiness.js'

export const COLISSIMO_LABEL_URL = 'https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0/generateLabel'
export const COLISSIMO_PRODUCT_CODES = new Set(['DOM', 'DOS'])
export const COLISSIMO_TRACKING_URL = 'https://www.laposte.fr/outils/suivre-vos-envois?code='

export class ColissimoError extends Error {
  constructor(message, { code = 'colissimo_error', retryable = false, messages = [] } = {}) {
    super(message)
    this.name = 'ColissimoError'
    this.code = code
    this.retryable = retryable
    this.messages = messages
  }
}

export function getColissimoConfig(env = process.env) {
  const contractNumber = String(env.COLISSIMO_CONTRACT_NUMBER || '').trim()
  const password = String(env.COLISSIMO_PASSWORD || '')
  const productCode = String(env.COLISSIMO_PRODUCT_CODE || 'DOS').trim().toUpperCase()
  return {
    configured: Boolean(contractNumber && password),
    contractNumber,
    password,
    productCode: COLISSIMO_PRODUCT_CODES.has(productCode) ? productCode : 'DOS',
    sender: {
      companyName: 'THEKLOPE',
      line2: '188 rue de Rome',
      zipCode: '13006',
      city: 'Marseille',
      countryCode: 'FR',
      email: 'contact@theklope.com',
      phoneNumber: frenchPhone(STORE_PHONE).number,
    },
  }
}

export function publicColissimoStatus(env = process.env) {
  const config = getColissimoConfig(env)
  return { configured: config.configured, productCode: config.productCode }
}

const clip = (value, max = 35) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

// Colissimo distingue le portable (SMS de suivi) du fixe. Format attendu :
// 10 chiffres commençant par 0 ; un +33 est converti.
export function frenchPhone(value) {
  let digits = String(value || '').replace(/[^\d+]/g, '')
  if (digits.startsWith('+33')) digits = `0${digits.slice(3)}`
  else if (digits.startsWith('0033')) digits = `0${digits.slice(4)}`
  if (!/^0\d{9}$/.test(digits)) return { number: '', mobile: false }
  return { number: digits, mobile: /^0[67]/.test(digits) }
}

export function splitCustomerName(customer = {}) {
  const first = clip(customer.firstName, 29)
  const last = clip(customer.lastName, 35)
  if (first || last) return { firstName: first, lastName: last || first }
  const parts = clip(customer.name, 80).split(' ').filter(Boolean)
  if (parts.length <= 1) return { firstName: '', lastName: parts[0] || '' }
  return { firstName: clip(parts[0], 29), lastName: clip(parts.slice(1).join(' '), 35) }
}

const parisDate = (now) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now)

export function buildColissimoLabelRequest({ order, weightGrams, config, now = new Date() }) {
  const grams = Math.round(Number(weightGrams))
  if (!Number.isFinite(grams) || grams < 10 || grams > 30000) {
    throw new ColissimoError('Poids du colis invalide (entre 10 g et 30 kg).', { code: 'invalid_weight' })
  }
  const address = order?.address || {}
  const customer = order?.customer || {}
  const { firstName, lastName } = splitCustomerName(customer)
  const zipCode = String(address.zip || '').replace(/\s+/g, '')
  if (!lastName || !clip(address.street) || !/^\d{5}$/.test(zipCode) || !clip(address.city)) {
    throw new ColissimoError('Adresse du destinataire incomplète (nom, rue, code postal ou ville).', { code: 'invalid_address' })
  }
  const phone = frenchPhone(customer.phone)

  return {
    contractNumber: config.contractNumber,
    password: config.password,
    outputFormat: { x: 0, y: 0, outputPrintingType: 'PDF_10x15_300dpi' },
    letter: {
      service: {
        productCode: config.productCode,
        depositDate: parisDate(now),
        orderNumber: clip(order.id, 30),
        commercialName: 'THEKLOPE',
      },
      parcel: { weight: Math.max(0.01, grams / 1000) },
      sender: {
        senderParcelRef: clip(order.id, 30),
        address: { ...config.sender },
      },
      addressee: {
        addresseeParcelRef: clip(order.id, 30),
        address: {
          lastName,
          ...(firstName ? { firstName } : {}),
          line2: clip(address.street),
          ...(clip(address.extra) ? { line3: clip(address.extra) } : {}),
          countryCode: 'FR',
          city: clip(address.city),
          zipCode,
          ...(customer.email ? { email: clip(customer.email, 80) } : {}),
          ...(phone.number ? (phone.mobile ? { mobileNumber: phone.number } : { phoneNumber: phone.number }) : {}),
        },
      },
    },
  }
}

const indexOf = (buffer, needle, from = 0) => buffer.indexOf(Buffer.from(needle, 'latin1'), from)

// Découpe la réponse multipart/mixed de Colissimo en { json, pdf }. Accepte
// aussi une réponse JSON simple (erreurs de validation).
export function parseColissimoResponse(body, contentType = '') {
  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body)
  const boundaryMatch = /boundary="?([^";]+)"?/i.exec(contentType)
  if (!boundaryMatch) {
    try {
      return { json: JSON.parse(buffer.toString('utf8')), pdf: null }
    } catch {
      throw new ColissimoError('Réponse Colissimo illisible.', { code: 'invalid_response', retryable: true })
    }
  }

  const delimiter = `--${boundaryMatch[1]}`
  const parts = []
  let cursor = indexOf(buffer, delimiter)
  while (cursor !== -1) {
    const start = cursor + delimiter.length
    if (buffer.slice(start, start + 2).toString('latin1') === '--') break
    const next = indexOf(buffer, delimiter, start)
    const raw = buffer.slice(start, next === -1 ? buffer.length : next)
    const separator = indexOf(raw, '\r\n\r\n')
    if (separator !== -1) {
      const headers = raw.slice(0, separator).toString('latin1').toLowerCase()
      let content = raw.slice(separator + 4)
      if (content.slice(-2).toString('latin1') === '\r\n') content = content.slice(0, -2)
      parts.push({ headers, content })
    }
    cursor = next
  }

  const jsonPart = parts.find((part) => part.headers.includes('application/json'))
  const pdfPart = parts.find((part) => part !== jsonPart && part.content.slice(0, 5).toString('latin1') === '%PDF-')
  let json = null
  if (jsonPart) {
    try {
      json = JSON.parse(jsonPart.content.toString('utf8'))
    } catch {
      throw new ColissimoError('Réponse Colissimo illisible.', { code: 'invalid_response', retryable: true })
    }
  }
  return { json, pdf: pdfPart ? pdfPart.content : null }
}

const errorMessages = (json) => (Array.isArray(json?.messages) ? json.messages : [])
  .filter((message) => String(message?.type || '').toUpperCase() === 'ERROR' || (message?.id && String(message.id) !== '0'))

// Crée l'étiquette. `fetchImpl` et `now` sont injectables pour les tests.
export async function createColissimoLabel({ order, weightGrams }, { config = getColissimoConfig(), fetchImpl = fetch, now = new Date() } = {}) {
  if (!config.configured) {
    throw new ColissimoError(
      'Colissimo n’est pas configuré : renseignez COLISSIMO_CONTRACT_NUMBER et COLISSIMO_PASSWORD dans Vercel.',
      { code: 'not_configured' },
    )
  }
  const payload = buildColissimoLabelRequest({ order, weightGrams, config, now })

  let response
  try {
    response = await fetchImpl(COLISSIMO_LABEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8', Accept: 'multipart/mixed, application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    })
  } catch (error) {
    throw new ColissimoError('Service Colissimo injoignable. Réessayez dans quelques minutes.', { code: 'network', retryable: true })
  }

  const body = Buffer.from(await response.arrayBuffer())
  const { json, pdf } = parseColissimoResponse(body, response.headers.get('content-type') || '')
  const errors = errorMessages(json)
  if (errors.length) {
    const detail = errors.map((message) => clip(message.messageContent, 200)).filter(Boolean).join(' · ')
    const credentials = errors.some((message) => ['30000', '30001', '30002'].includes(String(message.id)))
      || /identifiant|mot de passe|password|authentif/i.test(detail)
    throw new ColissimoError(
      credentials
        ? 'Identifiants Colissimo refusés : vérifiez le numéro de contrat et le mot de passe, et que les Web Services sont activés sur votre compte.'
        : `Colissimo a refusé l’étiquette : ${detail || 'erreur inconnue'}.`,
      { code: credentials ? 'bad_credentials' : 'rejected', messages: errors },
    )
  }
  if (!response.ok) {
    throw new ColissimoError(`Colissimo indisponible (HTTP ${response.status}).`, { code: 'http_error', retryable: response.status >= 500 })
  }
  const parcelNumber = String(json?.labelV2Response?.parcelNumber || json?.labelResponse?.parcelNumber || '').trim()
  if (!parcelNumber || !pdf) {
    throw new ColissimoError('Réponse Colissimo incomplète (numéro de colis ou PDF manquant).', { code: 'invalid_response', retryable: true })
  }
  return { parcelNumber, pdf, productCode: config.productCode }
}
