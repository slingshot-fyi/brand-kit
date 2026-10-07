// @ts-check
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { findColors, readGuide, readTokens, tokensToCss, TOPICS } from '../src/kit.mjs'

test('every rule in every guide carries its reason', async () => {
  for (const topic of TOPICS) {
    const rules = (await readGuide(topic))
      .split('\n')
      .filter((line) => line.startsWith('- **'))
    assert.ok(rules.length > 0, `${topic}.md has no rules`)
    for (const rule of rules) {
      assert.match(rule, /Because /, `${topic}.md: a rule without a reason: ${rule}`)
    }
  }
})

test('tokens.css defines a variable for every colour token', async () => {
  const tokens = await readTokens()
  const css = tokensToCss(tokens)
  for (const name of Object.keys(tokens.color)) {
    assert.ok(css.includes(`--slingshot-color-${name}:`), `missing ${name}`)
  }
})

test('a hand-written brand colour is named, an off-brand colour is flagged', async () => {
  const tokens = await readTokens()
  const findings = findColors('a { color: #161614; }\nb { color: #ff0055; }', tokens)
  assert.deepEqual(findings, [
    { line: 1, value: '#161614', token: 'ink' },
    { line: 2, value: '#ff0055', token: null },
  ])
})

test('the variables themselves are not reported', async () => {
  const tokens = await readTokens()
  const css = tokensToCss(tokens)
  assert.deepEqual(findColors(css, tokens), [])
})
