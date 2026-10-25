import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { rewritePrerenderRequest } from './preview-prerender.mjs'

test('preview serves nested prerendered HTML while preserving query parameters', async () => {
  const root = await mkdtemp(join(tmpdir(), 'theklope-preview-'))
  try {
    await mkdir(join(root, 'faq'))
    await writeFile(join(root, 'faq', 'index.html'), '<h1>FAQ</h1>')
    const request = { method: 'GET', url: '/faq?source=test' }
    rewritePrerenderRequest(request, root)
    assert.equal(request.url, '/faq/index.html?source=test')

    for (const url of ['/inconnue', '/assets/app.js', '/%ZZ', '/%2e%2e%2fsecret']) {
      const untouched = { method: 'GET', url }
      rewritePrerenderRequest(untouched, root)
      assert.equal(untouched.url, url)
    }
    const post = { method: 'POST', url: '/faq' }
    rewritePrerenderRequest(post, root)
    assert.equal(post.url, '/faq')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
