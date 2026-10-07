// @ts-check
// Keeps package.json and server.json in step, so the MCP Registry accepts the
// next publish: it checks the npm package's mcpName against server.json.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

/** @param {string} file */
async function readJson(file) {
  return JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'))
}

test('server.json names the same package and version as package.json', async () => {
  const pkg = await readJson('package.json')
  const server = await readJson('server.json')
  assert.equal(server.name, pkg.mcpName)
  assert.equal(server.version, pkg.version)
  assert.ok(server.description.length <= 100, 'the registry rejects longer descriptions')
  assert.equal(server.packages[0].identifier, pkg.name)
  assert.equal(server.packages[0].version, pkg.version)
})

test('npx with the package name starts the MCP server', async () => {
  // npx runs the bin named after the unscoped package name, so that bin has
  // to be the server.
  const pkg = await readJson('package.json')
  const binName = pkg.name.replace(/^@[^/]+\//, '')
  assert.equal(pkg.bin[binName], pkg.bin['slingshot-brand-mcp'])
})
