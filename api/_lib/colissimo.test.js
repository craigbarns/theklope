import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildColissimoLabelRequest,
  ColissimoError,
  createColissimoLabel,
  frenchPhone,
  getColissimoConfig,
  parseColissimoResponse,
  splitCustomerName,
} from './colissimo.js'

const config = getColissimoConfig({ COLISSIMO_CONTRACT_NUMBER: '123456', COLISSIMO_PASSWORD: 'secret' })
const order = {
  id: 'TK-20261001-AB12',
  customer: { name: 'Marie Claire Dupont', email: 'marie@exemple.fr', phone: '+33 6 12 34 56 78' },
  address: { street: '12 boulevard Baille', extra: 'Bât. B', zip: '13005', city: 'Marseille' },
}
const PDF = Buffer.from('%PDF-1.4\nÿþ binaire\r\n%%EOF', 'latin1')

function multipart(json, pdf = PDF, boundary = 'uuid:0f3b-11') {
  return Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json;charset=UTF-8\r\nContent-Transfer-Encoding: binary\r\nContent-ID: <jsonInfos>\r\n\r\n${JSON.stringify(json)}\r\n`, 'latin1'),
    ...(pdf ? [Buffer.from(`--${boundary}\r\nContent-Type: application/octet-stream\r\nContent-Transfer-Encoding: binary\r\nContent-ID: <label>\r\n\r\n`, 'latin1'), pdf, Buffer.from('\r\n', 'latin1')] : []),
    Buffer.from(`--${boundary}--\r\n`, 'latin1'),
  ])
}

const fakeFetch = (body, { status = 200, contentType = 'multipart/mixed; boundary="uuid:0f3b-11"; type="application/json"' } = {}) => {
  const calls = []
  const impl = async (url, init) => {
    calls.push({ url, init })
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: { get: () => contentType },
      arrayBuffer: async () => body,
    }
  }
  impl.calls = calls
  return impl
}

test('configuration : jamais configurée sans identifiants, code produit borné', () => {
  assert.equal(getColissimoConfig({}).configured, false)
  assert.equal(config.configured, true)
  assert.equal(config.productCode, 'DOS')
  assert.equal(getColissimoConfig({ COLISSIMO_CONTRACT_NUMBER: '1', COLISSIMO_PASSWORD: 'x', COLISSIMO_PRODUCT_CODE: 'dom' }).productCode, 'DOM')
  assert.equal(getColissimoConfig({ COLISSIMO_CONTRACT_NUMBER: '1', COLISSIMO_PASSWORD: 'x', COLISSIMO_PRODUCT_CODE: 'XYZ' }).productCode, 'DOS')
  assert.equal(config.sender.phoneNumber, '0491555555')
})

test('téléphone : portable pour les SMS, fixe sinon, invalide ignoré', () => {
  assert.deepEqual(frenchPhone('+33 6 12 34 56 78'), { number: '0612345678', mobile: true })
  assert.deepEqual(frenchPhone('04.91.55.55.55'), { number: '0491555555', mobile: false })
  assert.deepEqual(frenchPhone('12'), { number: '', mobile: false })
  assert.deepEqual(splitCustomerName({ name: 'Marie Claire Dupont' }), { firstName: 'Marie', lastName: 'Claire Dupont' })
  assert.deepEqual(splitCustomerName({ name: 'Madonna' }), { firstName: '', lastName: 'Madonna' })
})

test('requête : destinataire, expéditeur boutique, poids en kg, date de dépôt à Paris', () => {
  const request = buildColissimoLabelRequest({ order, weightGrams: 350, config, now: new Date('2026-10-01T22:30:00Z') })
  assert.equal(request.contractNumber, '123456')
  assert.equal(request.letter.service.productCode, 'DOS')
  assert.equal(request.letter.service.depositDate, '2026-10-02')
  assert.equal(request.letter.parcel.weight, 0.35)
  assert.equal(request.letter.sender.address.line2, '188 rue de Rome')
  assert.deepEqual(request.letter.addressee.address, {
    lastName: 'Claire Dupont',
    firstName: 'Marie',
    line2: '12 boulevard Baille',
    line3: 'Bât. B',
    countryCode: 'FR',
    city: 'Marseille',
    zipCode: '13005',
    email: 'marie@exemple.fr',
    mobileNumber: '0612345678',
  })
  assert.throws(() => buildColissimoLabelRequest({ order, weightGrams: 0, config }), /Poids/)
  assert.throws(
    () => buildColissimoLabelRequest({ order: { ...order, address: { ...order.address, zip: '130' } }, weightGrams: 200, config }),
    /Adresse/,
  )
})

test('réponse multipart : numéro de colis et PDF binaire intact', async () => {
  const fetchImpl = fakeFetch(multipart({ messages: [{ id: '0', type: 'INFOS', messageContent: 'OK' }], labelV2Response: { parcelNumber: '6A12345678901' } }))
  const label = await createColissimoLabel({ order, weightGrams: 300 }, { config, fetchImpl })
  assert.equal(label.parcelNumber, '6A12345678901')
  assert.ok(label.pdf.equals(PDF), 'le PDF doit être restitué octet pour octet')
  assert.equal(fetchImpl.calls[0].url, 'https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0/generateLabel')
  assert.equal(JSON.parse(fetchImpl.calls[0].init.body).password, 'secret')
})

test('erreurs : identifiants refusés, adresse refusée, sans configuration', async () => {
  const badLogin = fakeFetch(multipart({ messages: [{ id: '30000', type: 'ERROR', messageContent: 'Identifiant ou mot de passe invalide' }] }, null))
  await assert.rejects(
    createColissimoLabel({ order, weightGrams: 300 }, { config, fetchImpl: badLogin }),
    (error) => error instanceof ColissimoError && error.code === 'bad_credentials',
  )

  const rejected = fakeFetch(
    Buffer.from(JSON.stringify({ messages: [{ id: '30220', type: 'ERROR', messageContent: 'Le code postal du destinataire est invalide' }] })),
    { status: 400, contentType: 'application/json' },
  )
  await assert.rejects(
    createColissimoLabel({ order, weightGrams: 300 }, { config, fetchImpl: rejected }),
    /code postal du destinataire est invalide/,
  )

  await assert.rejects(
    createColissimoLabel({ order, weightGrams: 300 }, { config: getColissimoConfig({}), fetchImpl: fakeFetch(Buffer.alloc(0)) }),
    (error) => error.code === 'not_configured',
  )
})

test('le parseur accepte une réponse JSON simple', () => {
  const parsed = parseColissimoResponse(Buffer.from('{"messages":[]}'), 'application/json')
  assert.deepEqual(parsed, { json: { messages: [] }, pdf: null })
})
