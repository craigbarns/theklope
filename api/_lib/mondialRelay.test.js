import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildShipmentCreationXml,
  createMondialRelayLabel,
  getMondialRelayConfig,
  MondialRelayError,
  normalizeFrenchPhone,
  normalizeRelayId,
  publicMondialRelayStatus,
  searchRelayPoints,
  traceMondialRelayShipment,
} from './mondialRelay.js'

const config = {
  api1: {
    url: 'https://api.example.test/WebService.asmx',
    enseigne: 'TESTSHOP',
    privateKey: 'private!',
    configured: true,
  },
  api2: {
    url: 'https://connect-api.example.test/api/Shipment',
    login: 'shop@business-api.example.test',
    password: 'secret<&',
    customerId: 'TESTSHOP',
    configured: true,
    environment: 'production',
  },
  sender: {
    name: 'THEKLOPE',
    street: '188 rue de Rome',
    postcode: '13006',
    city: 'Marseille',
    countryCode: 'FR',
    phone: '+33491555555',
    email: 'contact@theklope.com',
  },
}

const shipmentInput = {
  orderId: 'TK-20260902-ABC123',
  weightGrams: 1250,
  deliveryMode: '24R',
  relayId: 'FR-12345',
  customer: {
    name: 'Élodie O’Neil',
    phone: '06 12 34 56 78',
    email: 'elodie@example.com',
  },
  address: {
    street: '12 rue de l’Église',
    extra: 'Bâtiment A & interphone 4',
    zip: '75001',
    city: 'Paris',
  },
  instructions: 'Appeler <avant> de livrer',
}

test('public status exposes readiness without exposing credentials', () => {
  const env = {
    MONDIAL_RELAY_API1_ENSEIGNE: 'SHOP',
    MONDIAL_RELAY_API1_PRIVATE_KEY: 'private',
    MONDIAL_RELAY_API2_LOGIN: 'login',
    MONDIAL_RELAY_API2_PASSWORD: 'password',
    MONDIAL_RELAY_API2_CUSTOMER_ID: 'SHOP',
  }
  const privateConfig = getMondialRelayConfig(env)
  const status = publicMondialRelayStatus(env)

  assert.equal(privateConfig.api1.configured, true)
  assert.equal(privateConfig.api2.configured, true)
  assert.deepEqual(status.api1, { configured: true })
  assert.deepEqual(status.api2, { configured: true, environment: 'production' })
  assert.doesNotMatch(JSON.stringify(status), /private|password|login/i)
})

test('normalizers accept Mondial Relay and French phone formats', () => {
  assert.equal(normalizeRelayId('12345'), 'FR-12345')
  assert.equal(normalizeRelayId('fr12345'), 'FR-12345')
  assert.equal(normalizeRelayId('FR-12345'), 'FR-12345')
  assert.equal(normalizeRelayId('invalid'), '')
  assert.equal(normalizeFrenchPhone('06 12 34 56 78'), '+33612345678')
  assert.equal(normalizeFrenchPhone('0033 6 12 34 56 78'), '+33612345678')
})

test('shipment XML follows API 2 order and escapes credentials and customer data', () => {
  const xml = buildShipmentCreationXml(shipmentInput, config)

  assert.match(xml, /<Password>secret&lt;&amp;<\/Password>/)
  assert.match(xml, /<OrderNo>20260902-ABC123<\/OrderNo>/)
  assert.match(xml, /<DeliveryMode Mode="24R" Location="FR-12345" \/>/)
  assert.match(xml, /<Weight Value="1250" Unit="gr" \/>/)
  assert.match(xml, /<Firstname>Elodie<\/Firstname>/)
  assert.match(xml, /<HouseNo>12<\/HouseNo><CountryCode>FR<\/CountryCode>/)
  assert.match(xml, /<DeliveryInstruction>Appeler avant de livrer<\/DeliveryInstruction>/)
  assert.doesNotMatch(xml, /É|’|<avant>/)
})

test('home labels require a valid French phone', () => {
  assert.throws(
    () => buildShipmentCreationXml({
      ...shipmentInput,
      deliveryMode: 'HOM',
      relayId: '',
      customer: { ...shipmentInput.customer, phone: 'inconnu' },
    }, config),
    (error) => error instanceof MondialRelayError && error.code === 'recipient_phone_required',
  )
})

test('API 1 relay search signs the SOAP request and parses relay details', async () => {
  let request
  const fetchImpl = async (url, init) => {
    request = { url, ...init }
    return new Response(`<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><WSI4_PointRelais_RechercheResponse xmlns="http://www.mondialrelay.fr/webservice/"><WSI4_PointRelais_RechercheResult><STAT>0</STAT><PointsRelais><PointRelais_Details><STAT>0</STAT><Num>12345</Num><LgAdr1>LOCKER CENTRAL</LgAdr1><LgAdr3>10 RUE DU TEST</LgAdr3><CP>75001</CP><Ville>PARIS</Ville><Pays>FR</Pays><Latitude>48,86</Latitude><Longitude>2,35</Longitude><Distance>850</Distance></PointRelais_Details></PointsRelais></WSI4_PointRelais_RechercheResult></WSI4_PointRelais_RechercheResponse></soap:Body></soap:Envelope>`, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const points = await searchRelayPoints({ postcode: '75001', weightGrams: 500 }, { config, fetchImpl })

  assert.equal(request.url, config.api1.url)
  assert.equal(request.headers.SOAPAction, 'http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche')
  assert.match(request.body, /<Security>[A-F0-9]{32}<\/Security>/)
  assert.doesNotMatch(request.body, /private!<\/Security>/)
  assert.deepEqual(points, [{
    id: 'FR-12345',
    number: '12345',
    name: 'LOCKER CENTRAL',
    address: '10 RUE DU TEST',
    postcode: '75001',
    city: 'PARIS',
    country: 'FR',
    latitude: '48.86',
    longitude: '2.35',
    distanceMeters: 850,
    photoUrl: '',
    mapUrl: '',
  }])
})

test('API 1 tracing parses shipment events', async () => {
  const fetchImpl = async () => new Response(`<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><WSI2_TracingColisDetailleResponse xmlns="http://www.mondialrelay.fr/webservice/"><WSI2_TracingColisDetailleResult><Libelle01>Colis pris en charge</Libelle01><Relais_Libelle>LOCKER CENTRAL</Relais_Libelle><Relais_Num>12345</Relais_Num><Tracing><ret_WSI2_sub_TracingColisDetaille><Libelle>Disponible au Point Relais</Libelle><Date>02/09/2026</Date><Heure>10:30</Heure><Emplacement>PARIS</Emplacement><Relais_Num>12345</Relais_Num><Relais_Pays>FR</Relais_Pays></ret_WSI2_sub_TracingColisDetaille></Tracing></WSI2_TracingColisDetailleResult></WSI2_TracingColisDetailleResponse></soap:Body></soap:Envelope>`, { status: 200 })

  const tracking = await traceMondialRelayShipment('12345678', { config, fetchImpl })
  assert.equal(tracking.summary, 'Colis pris en charge')
  assert.equal(tracking.relayName, 'LOCKER CENTRAL')
  assert.equal(tracking.events[0].label, 'Disponible au Point Relais')
})

test('API 1 relay search surfaces a STAT error even when it is nested in a relay entry', async () => {
  const fetchImpl = async () => new Response(`<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><WSI4_PointRelais_RechercheResponse xmlns="http://www.mondialrelay.fr/webservice/"><WSI4_PointRelais_RechercheResult><PointsRelais><PointRelais_Details><STAT>97</STAT></PointRelais_Details></PointsRelais></WSI4_PointRelais_RechercheResult></WSI4_PointRelais_RechercheResponse></soap:Body></soap:Envelope>`, { status: 200 })

  await assert.rejects(
    searchRelayPoints({ postcode: '75001' }, { config, fetchImpl }),
    (error) => error instanceof MondialRelayError && error.code === 'api1_stat_97',
  )
})

test('API 2 returns the shipment number and decoded PDF URL', async () => {
  let requestBody = ''
  const fetchImpl = async (url, init) => {
    requestBody = init.body
    return new Response(`<?xml version="1.0"?><ShipmentCreationResponse xmlns="http://www.example.org/Response"><Context/><OutputOptions/><ShipmentsList><Shipment ShipmentNumber="96408887"><LabelList><Label><RawContent><Barcodes><Barcode DisplayedValue="11964088870" /></Barcodes></RawContent><Output>https://connect.example.test/label?exp=96408887&amp;format=10x15</Output></Label></LabelList></Shipment></ShipmentsList><StatusList /></ShipmentCreationResponse>`, { status: 200 })
  }

  const label = await createMondialRelayLabel(shipmentInput, { config, fetchImpl })

  assert.match(requestBody, /<CustomerId>TESTSHOP<\/CustomerId>/)
  assert.equal(label.shipmentNumber, '96408887')
  assert.equal(label.barcode, '11964088870')
  assert.equal(label.labelUrl, 'https://connect.example.test/label?exp=96408887&format=10x15')
})

test('API 2 exposes business errors without treating them as transport retries', async () => {
  const fetchImpl = async () => new Response(`<?xml version="1.0"?><ShipmentCreationResponse xmlns="http://www.example.org/Response"><StatusList><Status Code="10002" Level="Error" Message="Invalid credentials" /></StatusList></ShipmentCreationResponse>`, { status: 200 })

  await assert.rejects(
    createMondialRelayLabel(shipmentInput, { config, fetchImpl }),
    (error) => (
      error instanceof MondialRelayError
      && error.code === 'api2_status_10002'
      && error.retryable === false
      && /Invalid credentials/.test(error.message)
    ),
  )
})
