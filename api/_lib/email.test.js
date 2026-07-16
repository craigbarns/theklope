import assert from 'node:assert/strict'
import test from 'node:test'

import { escapeHtmlWithLineBreaks } from './email.js'

test('multiline customer text is escaped before email line breaks are added', () => {
  const html = escapeHtmlWithLineBreaks('<img src=x onerror="alert(1)">\n3e étage')

  assert.equal(html, '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;<br>3e étage')
  assert.equal(html.includes('<img'), false)
})
