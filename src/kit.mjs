// @ts-check
// Reads the kit in ../brand and checks text against it. Shared by the CLI
// and the MCP server, so both always give the same answer.

import { readFile } from 'node:fs/promises'

const BRAND = new URL('../brand/', import.meta.url)

/** The guides in brand/, in the order that wins when two rules conflict. */
export const TOPICS = /** @type {const} */ ([
  'voice',
  'layout',
  'typography',
  'color',
  'mark',
])

/** @typedef {(typeof TOPICS)[number]} Topic */

/** @param {string} name */
function read(name) {
  return readFile(new URL(name, BRAND), 'utf8')
}

/** The router: which guide to read for which task. */
export function readRouter() {
  return read('readme.md')
}

/** @param {Topic} topic */
export function readGuide(topic) {
  if (!TOPICS.includes(topic)) {
    throw new Error(`Unknown topic "${topic}". Use one of: ${TOPICS.join(', ')}.`)
  }
  return read(`${topic}.md`)
}

/**
 * @typedef {{
 *   color: Record<string, { value: string, hex?: string }>,
 *   font: Record<string, string>,
 *   size: Record<string, string>,
 *   space: Record<string, string>,
 * }} Tokens
 */

/** @returns {Promise<Tokens>} */
export async function readTokens() {
  return JSON.parse(await read('tokens.json'))
}

/** @param {Tokens} tokens */
export function tokensToCss(tokens) {
  const lines = [
    '/* Generated from brand/tokens.json by `npm run tokens`. Do not edit. */',
    ':root {',
  ]
  for (const [name, { value }] of Object.entries(tokens.color)) {
    lines.push(`  --slingshot-color-${name}: ${value};`)
  }
  for (const group of /** @type {const} */ (['font', 'size', 'space'])) {
    for (const [name, value] of Object.entries(tokens[group])) {
      lines.push(`  --slingshot-${group}-${name}: ${value};`)
    }
  }
  lines.push('}', '')
  return lines.join('\n')
}

// Hex, and the CSS colour functions. It can flag look-alikes such as "#add"
// in prose; the report gives the line so a person can judge.
const COLOR =
  /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([^)]*\)/gi

/** @param {string} value */
function normalise(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * @typedef {{ line: number, value: string, token: string | null }} ColorFinding
 */

/**
 * Every raw colour in `text`. A finding with a `token` is a brand colour
 * written out by hand: replace it with the variable. A finding without one
 * is off-brand.
 *
 * @param {string} text
 * @param {Tokens} tokens
 * @returns {ColorFinding[]}
 */
export function findColors(text, tokens) {
  /** @type {Map<string, string>} */
  const known = new Map()
  for (const [name, { value, hex }] of Object.entries(tokens.color)) {
    known.set(normalise(value), name)
    if (hex) known.set(normalise(hex), name)
  }

  /** @type {ColorFinding[]} */
  const findings = []
  text.split('\n').forEach((lineText, index) => {
    // Skip the variable definitions themselves.
    if (lineText.includes('--slingshot-color-')) return
    for (const match of lineText.matchAll(COLOR)) {
      findings.push({
        line: index + 1,
        value: match[0],
        token: known.get(normalise(match[0])) ?? null,
      })
    }
  })
  return findings
}
