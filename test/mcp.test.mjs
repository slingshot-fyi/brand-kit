// @ts-check
// Starts the real server over stdio and talks to it with the SDK's client.
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const client = new Client({ name: 'brand-kit-test', version: '0.0.0' })

before(async () => {
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(new URL('../mcp/server.mjs', import.meta.url))],
    })
  )
})

after(() => client.close())

/** @param {unknown} result */
function textOf(result) {
  // SAFETY: every tool on this server replies with one text block.
  const { content } = /** @type {{ content: { text: string }[] }} */ (result)
  return content[0]?.text ?? ''
}

test('lists the three brand tools', async () => {
  const { tools } = await client.listTools()
  assert.deepEqual(tools.map((tool) => tool.name).sort(), [
    'brand_guide',
    'brand_tokens',
    'check_colors',
  ])
})

test('brand_guide routes first, then serves a guide', async () => {
  const router = textOf(await client.callTool({ name: 'brand_guide', arguments: {} }))
  assert.match(router, /Read this file first/)
  const voice = textOf(await client.callTool({ name: 'brand_guide', arguments: { topic: 'voice' } }))
  assert.match(voice, /Make only claims that are true today/)
})

test('brand_tokens returns CSS variables', async () => {
  const css = textOf(await client.callTool({ name: 'brand_tokens', arguments: { format: 'css' } }))
  assert.match(css, /--slingshot-color-ink: oklch\(0\.2 0\.003 95\);/)
})

test('check_colors names brand colours and flags the rest', async () => {
  const report = textOf(
    await client.callTool({
      name: 'check_colors',
      arguments: { text: 'color: #646361;\nbackground: #00ff00;' },
    })
  )
  assert.match(report, /line 1: #646361 is stone/)
  assert.match(report, /line 2: #00ff00 is not a brand colour/)
})
