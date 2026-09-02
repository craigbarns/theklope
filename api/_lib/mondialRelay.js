import { createHash } from 'node:crypto'
import { XMLParser } from 'fast-xml-parser'

const API1_DEFAULT_URL = 'https://api.mondialrelay.com/WebService.asmx'
const API2_PRODUCTION_URL = 'https://connect-api.mondialrelay.com/api/shipment'
const API2_SANDBOX_URL = 'https://connect-api-sandbox.mondialrelay.com/api/shipment'
const API1_NAMESPACE = 'http://www.mondialrelay.fr/webservice/'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
})

const list = (value) => value == null ? [] : Array.isArray(value) ? value : [value]
const compact = (value) => String(value ?? '').replace(/\u0000/g, '').trim()
const upper = (value) => compact(value).toUpperCase()

const escapeXml = (value) => compact(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const ascii = (value) => compact(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const labelText = (value, max) => ascii(value)
  .replace(/[^0-9A-Za-z _\-'.,/]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, max)

const orderReference = (value) => upper(value)
  .replace(/[^0-9A-Z_ -]/g, '')
  .slice(-15)

const normalizeRelayId = (value) => {
  const raw = upper(value).replace(/\s+/g, '')
  const match = /^(?:([A-Z]{2})-?)?(\d{5})$/.exec(raw)
  if (!match) return ''
  return `${match[1] || 'FR'}-${match[2]}`
}

const normalizeFrenchPhone = (value) => {
  const digits = compact(value).replace(/[^\d+]/g, '')
  if (/^0\d{9}$/.test(digits)) return `+33${digits.slice(1)}`
  if (/^0033\d{9}$/.test(digits)) return `+${digits.slice(2)}`
  if (/^\+33\d{9}$/.test(digits)) return digits
  return ''
}

const splitStreet = (value) => {
  const clean = labelText(value, 80)
  const match = /^(\d+(?:\s*(?:BIS|TER|QUATER))?)\s+(.+)$/i.exec(clean)
  if (!match) return { houseNo: '', streetName: clean.slice(0, 30) }
  return {
    houseNo: labelText(match[1], 10),
    streetName: labelText(match[2], Math.max(1, 30 - Math.min(match[1].length + 1, 11))),
  }
}

const splitPersonName = (value) => {
  const clean = labelText(value, 60)
  const [first = '', ...rest] = clean.split(/\s+/)
  return {
    firstName: first.slice(0, 30),
    lastName: (rest.join(' ') || first).slice(0, 30),
    displayName: clean.slice(0, 30),
  }
}

const parseXml = (xml, service) => {
  try {
    return parser.parse(xml)
  } catch (error) {
    throw new MondialRelayError(
      `${service} a renvoyé une réponse illisible.`,
      { code: 'invalid_xml', cause: error, retryable: true },
    )
  }
}

export class MondialRelayError extends Error {
  constructor(message, { code = 'mondial_relay_error', cause, retryable = false, statuses = [] } = {}) {
    super(message, cause ? { cause } : undefined)
    this.name = 'MondialRelayError'
    this.code = code
    this.retryable = retryable
    this.statuses = statuses
  }
}

export function getMondialRelayConfig(env = process.env) {
  const api2Url = compact(env.MONDIAL_RELAY_API2_URL)
    || (String(env.MONDIAL_RELAY_API2_SANDBOX).toLowerCase() === 'true'
      ? API2_SANDBOX_URL
      : API2_PRODUCTION_URL)

  const config = {
    api1: {
      url: compact(env.MONDIAL_RELAY_API1_URL) || API1_DEFAULT_URL,
      enseigne: upper(env.MONDIAL_RELAY_API1_ENSEIGNE),
      privateKey: compact(env.MONDIAL_RELAY_API1_PRIVATE_KEY),
    },
    api2: {
      url: api2Url,
      login: compact(env.MONDIAL_RELAY_API2_LOGIN),
      password: compact(env.MONDIAL_RELAY_API2_PASSWORD),
      customerId: upper(env.MONDIAL_RELAY_API2_CUSTOMER_ID),
    },
    sender: {
      name: compact(env.MONDIAL_RELAY_SENDER_NAME) || 'THEKLOPE',
      street: compact(env.MONDIAL_RELAY_SENDER_STREET) || '188 rue de Rome',
      postcode: compact(env.MONDIAL_RELAY_SENDER_POSTCODE) || '13006',
      city: compact(env.MONDIAL_RELAY_SENDER_CITY) || 'Marseille',
      countryCode: upper(env.MONDIAL_RELAY_SENDER_COUNTRY_CODE) || 'FR',
      phone: compact(env.MONDIAL_RELAY_SENDER_PHONE) || '+33491555555',
      email: compact(env.MONDIAL_RELAY_SENDER_EMAIL) || 'contact@theklope.com',
    },
  }

  config.api1.configured = Boolean(config.api1.enseigne && config.api1.privateKey)
  config.api2.configured = Boolean(config.api2.login && config.api2.password && config.api2.customerId)
  config.api2.environment = /sandbox/i.test(config.api2.url) ? 'sandbox' : 'production'
  return config
}

export function publicMondialRelayStatus(env = process.env) {
  const config = getMondialRelayConfig(env)
  return {
    api1: { configured: config.api1.configured },
    api2: { configured: config.api2.configured, environment: config.api2.environment },
    sender: {
      name: config.sender.name,
      city: config.sender.city,
      postcode: config.sender.postcode,
    },
  }
}

const api1Security = (params, privateKey) => createHash('md5')
  .update(`${Object.values(params).join('')}${privateKey}`, 'utf8')
  .digest('hex')
  .toUpperCase()

const soapEnvelope = (method, params, security) => {
  const fields = Object.entries({ ...params, Security: security })
    .map(([key, value]) => `<${key}>${escapeXml(value)}</${key}>`)
    .join('')
  return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><${method} xmlns="${API1_NAMESPACE}">${fields}</${method}></soap:Body></soap:Envelope>`
}

async function callApi1(method, params, { config = getMondialRelayConfig(), fetchImpl = fetch } = {}) {
  if (!config.api1.configured) {
    throw new MondialRelayError('Les identifiants Mondial Relay API 1 ne sont pas configurés.', {
      code: 'api1_not_configured',
    })
  }
  const security = api1Security(params, config.api1.privateKey)
  let response
  try {
    response = await fetchImpl(config.api1.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `${API1_NAMESPACE}${method}`,
      },
      body: soapEnvelope(method, params, security),
      signal: AbortSignal.timeout(12_000),
    })
  } catch (error) {
    throw new MondialRelayError('Mondial Relay API 1 est temporairement indisponible.', {
      code: 'api1_unavailable',
      cause: error,
      retryable: true,
    })
  }
  const xml = await response.text()
  if (!response.ok) {
    throw new MondialRelayError(`Mondial Relay API 1 a répondu HTTP ${response.status}.`, {
      code: 'api1_http_error',
      retryable: response.status >= 500,
    })
  }
  return parseXml(xml, 'Mondial Relay API 1')
}

export async function searchRelayPoints({ postcode, country = 'FR', weightGrams = 1000, limit = 10 } = {}, options = {}) {
  const cleanPostcode = compact(postcode).replace(/\s+/g, '')
  if (!/^\d{5}$/.test(cleanPostcode)) {
    throw new MondialRelayError('Le code postal doit contenir 5 chiffres.', { code: 'invalid_postcode' })
  }
  const config = options.config || getMondialRelayConfig()
  const params = {
    Enseigne: config.api1.enseigne,
    Pays: upper(country) || 'FR',
    NumPointRelais: '',
    Ville: '',
    CP: cleanPostcode,
    Latitude: '',
    Longitude: '',
    Taille: '',
    Poids: String(Math.max(10, Math.min(30_000, Math.round(Number(weightGrams) || 1000)))),
    Action: '24R',
    DelaiEnvoi: '0',
    RayonRecherche: '20',
    TypeActivite: '',
    NACE: '',
    NombreResultats: String(Math.max(1, Math.min(30, Math.round(Number(limit) || 10)))),
  }
  const payload = await callApi1('WSI4_PointRelais_Recherche', params, { ...options, config })
  const result = payload?.Envelope?.Body?.WSI4_PointRelais_RechercheResponse?.WSI4_PointRelais_RechercheResult
  if (!result) {
    throw new MondialRelayError('Réponse de recherche Point Relais incomplète.', {
      code: 'api1_invalid_response',
      retryable: true,
    })
  }
  const pointDetails = list(result.PointsRelais?.PointRelais_Details)
  const stat = compact(result.STAT || pointDetails.find((point) => point?.STAT)?.STAT)
  if (stat && stat !== '0') {
    throw new MondialRelayError(`Recherche Mondial Relay refusée (code ${stat}).`, {
      code: `api1_stat_${stat}`,
    })
  }
  const points = pointDetails
    .filter((point) => !point.STAT || String(point.STAT) === '0')
    .map((point) => ({
      id: normalizeRelayId(`${point.Pays || country}-${point.Num || ''}`),
      number: compact(point.Num),
      name: compact(point.LgAdr1),
      address: [point.LgAdr2, point.LgAdr3, point.LgAdr4].map(compact).filter(Boolean).join(' '),
      postcode: compact(point.CP),
      city: compact(point.Ville),
      country: upper(point.Pays || country),
      latitude: compact(point.Latitude).replace(',', '.'),
      longitude: compact(point.Longitude).replace(',', '.'),
      distanceMeters: Number.parseInt(compact(point.Distance), 10) || null,
      photoUrl: compact(point.URL_Photo),
      mapUrl: compact(point.URL_Plan),
    }))
    .filter((point) => point.id)

  return points
}

export async function traceMondialRelayShipment(shipmentNumber, options = {}) {
  const cleanNumber = compact(shipmentNumber).replace(/\s+/g, '')
  if (!/^\d{8,14}$/.test(cleanNumber)) {
    throw new MondialRelayError('Numéro d’expédition Mondial Relay invalide.', {
      code: 'invalid_shipment_number',
    })
  }
  const config = options.config || getMondialRelayConfig()
  const params = {
    Enseigne: config.api1.enseigne,
    Expedition: cleanNumber,
    Langue: 'FR',
  }
  const payload = await callApi1('WSI2_TracingColisDetaille', params, { ...options, config })
  const result = payload?.Envelope?.Body?.WSI2_TracingColisDetailleResponse?.WSI2_TracingColisDetailleResult
  if (!result) {
    throw new MondialRelayError('Réponse de suivi Mondial Relay incomplète.', {
      code: 'api1_invalid_response',
      retryable: true,
    })
  }
  const events = list(result.Tracing?.ret_WSI2_sub_TracingColisDetaille)
    .map((event) => ({
      label: compact(event.Libelle),
      date: compact(event.Date),
      time: compact(event.Heure),
      location: compact(event.Emplacement),
      relayNumber: compact(event.Relais_Num),
      relayCountry: compact(event.Relais_Pays),
    }))
    .filter((event) => event.label || event.date)
  return {
    shipmentNumber: cleanNumber,
    summary: [result.Libelle01, result.Libelle02].map(compact).filter(Boolean).join(' · '),
    relayName: compact(result.Relais_Libelle),
    relayNumber: compact(result.Relais_Num),
    events,
  }
}

function addressXml(address, { recipient = false } = {}) {
  const { houseNo, streetName } = splitStreet(address.street)
  const name = splitPersonName(address.name)
  const phone = normalizeFrenchPhone(address.phone)
  const email = compact(address.email).slice(0, 70)
  if (!streetName || !/^\d{5}$/.test(compact(address.postcode)) || !labelText(address.city, 30)) {
    throw new MondialRelayError(`${recipient ? 'Adresse destinataire' : 'Adresse expéditeur'} incomplète.`, {
      code: recipient ? 'invalid_recipient_address' : 'invalid_sender_address',
    })
  }
  return `<Address><Title></Title><Firstname>${escapeXml(name.firstName)}</Firstname><Lastname>${escapeXml(name.lastName)}</Lastname><Streetname>${escapeXml(streetName)}</Streetname><HouseNo>${escapeXml(houseNo)}</HouseNo><CountryCode>${escapeXml(upper(address.countryCode) || 'FR')}</CountryCode><PostCode>${escapeXml(compact(address.postcode).slice(0, 10))}</PostCode><City>${escapeXml(labelText(address.city, 30))}</City><AddressAdd1>${escapeXml(name.displayName)}</AddressAdd1><AddressAdd2></AddressAdd2><AddressAdd3>${escapeXml(labelText(address.extra, 30))}</AddressAdd3><PhoneNo>${escapeXml(phone)}</PhoneNo><MobileNo></MobileNo><Email>${escapeXml(email)}</Email></Address>`
}

export function buildShipmentCreationXml({
  orderId,
  weightGrams,
  deliveryMode = '24R',
  relayId = '',
  customer,
  address,
  instructions = '',
  sender,
}, config = getMondialRelayConfig()) {
  const mode = upper(deliveryMode)
  if (!['24R', 'HOM'].includes(mode)) {
    throw new MondialRelayError('Mode de livraison Mondial Relay invalide.', { code: 'invalid_delivery_mode' })
  }
  const location = mode === '24R' ? normalizeRelayId(relayId) : ''
  if (mode === '24R' && !location) {
    throw new MondialRelayError('Choisissez un Point Relais ou Locker.', { code: 'relay_required' })
  }
  const grams = Math.round(Number(weightGrams))
  if (!Number.isInteger(grams) || grams < 10 || grams > 30_000) {
    throw new MondialRelayError('Le poids doit être compris entre 10 g et 30 kg.', { code: 'invalid_weight' })
  }
  const recipient = {
    name: compact(customer?.name),
    phone: compact(customer?.phone),
    email: compact(customer?.email),
    street: compact(address?.street),
    extra: compact(address?.extra),
    postcode: compact(address?.zip),
    city: compact(address?.city),
    countryCode: 'FR',
  }
  if (mode === 'HOM' && !normalizeFrenchPhone(recipient.phone)) {
    throw new MondialRelayError('Un téléphone français valide est requis pour la livraison à domicile.', {
      code: 'recipient_phone_required',
    })
  }
  const senderSource = sender || config.sender
  const senderAddress = {
    name: senderSource?.name,
    phone: senderSource?.phone,
    email: senderSource?.email,
    street: senderSource?.street,
    postcode: senderSource?.postcode,
    city: senderSource?.city,
    countryCode: senderSource?.countryCode,
  }
  const deliveryInstruction = labelText(instructions, 30)
  const deliveryLocation = location ? ` Location="${escapeXml(location)}"` : ''
  return `<?xml version="1.0" encoding="utf-8"?><ShipmentCreationRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.example.org/Request"><Context><Login>${escapeXml(config.api2.login)}</Login><Password>${escapeXml(config.api2.password)}</Password><CustomerId>${escapeXml(config.api2.customerId)}</CustomerId><Culture>fr-FR</Culture><VersionAPI>1.0</VersionAPI></Context><OutputOptions><OutputFormat>10x15</OutputFormat><OutputType>PdfUrl</OutputType></OutputOptions><ShipmentsList><Shipment><OrderNo>${escapeXml(orderReference(orderId))}</OrderNo><ParcelCount>1</ParcelCount><DeliveryMode Mode="${escapeXml(mode)}"${deliveryLocation} /><CollectionMode Mode="CCC" /><Parcels><Parcel><Content>PRODUITS THEKLOPE</Content><Weight Value="${grams}" Unit="gr" /></Parcel></Parcels>${deliveryInstruction ? `<DeliveryInstruction>${escapeXml(deliveryInstruction)}</DeliveryInstruction>` : ''}<Sender>${addressXml(senderAddress)}</Sender><Recipient>${addressXml(recipient, { recipient: true })}</Recipient></Shipment></ShipmentsList></ShipmentCreationRequest>`
}

export async function createMondialRelayLabel(input, { config = getMondialRelayConfig(), fetchImpl = fetch } = {}) {
  if (!config.api2.configured) {
    throw new MondialRelayError('Les identifiants Mondial Relay API 2 ne sont pas configurés.', {
      code: 'api2_not_configured',
    })
  }
  const body = buildShipmentCreationXml({ ...input, sender: input.sender || config.sender }, config)
  let response
  try {
    response = await fetchImpl(config.api2.url, {
      method: 'POST',
      headers: { Accept: 'application/xml', 'Content-Type': 'text/xml; charset=utf-8' },
      body,
      signal: AbortSignal.timeout(20_000),
    })
  } catch (error) {
    throw new MondialRelayError(
      'La création a été interrompue. Vérifiez Connect avant de réessayer afin d’éviter un doublon.',
      { code: 'api2_result_uncertain', cause: error, retryable: false },
    )
  }
  const xml = await response.text()
  if (!response.ok) {
    throw new MondialRelayError(`Mondial Relay API 2 a répondu HTTP ${response.status}.`, {
      code: 'api2_http_error',
      retryable: response.status >= 500,
    })
  }
  const parsed = parseXml(xml, 'Mondial Relay API 2')
  const root = parsed?.ShipmentCreationResponse
  const statuses = list(root?.StatusList?.Status).map((status) => ({
    code: compact(status?.['@_Code']),
    level: compact(status?.['@_Level']),
    message: compact(status?.['@_Message']),
  }))
  const errors = statuses.filter((status) => /error|critical/i.test(status.level))
  if (errors.length) {
    throw new MondialRelayError(
      errors.map((status) => status.message || `Erreur ${status.code}`).join(' · '),
      { code: `api2_status_${errors[0].code || 'error'}`, statuses },
    )
  }
  const shipment = list(root?.ShipmentsList?.Shipment)[0]
  const label = list(shipment?.LabelList?.Label)[0]
  const shipmentNumber = compact(shipment?.['@_ShipmentNumber'])
  const labelUrl = compact(label?.Output)
  const barcode = list(label?.RawContent?.Barcodes?.Barcode)
    .map((entry) => compact(entry?.['@_DisplayedValue'] || entry?.['@_Value']))
    .find(Boolean) || ''
  if (!shipmentNumber || !/^https?:\/\//i.test(labelUrl)) {
    throw new MondialRelayError('Mondial Relay n’a pas renvoyé de numéro et d’étiquette exploitables.', {
      code: 'api2_invalid_response',
      retryable: true,
      statuses,
    })
  }
  return {
    shipmentNumber,
    labelUrl,
    barcode,
    statuses,
    environment: config.api2.environment,
  }
}

export { normalizeRelayId, normalizeFrenchPhone }
