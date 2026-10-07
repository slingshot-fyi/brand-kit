#!/usr/bin/env node
// @ts-check
// An MCP server over stdio, so an agent can look up Slingshot's brand while
// it works instead of guessing.

import { readFileSync } from 'node:fs'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

import {
  findColors,
  readGuide,
  readRouter,
  readTokens,
  tokensToCss,
  TOPICS,
} from '../src/kit.mjs'

/** @param {string} text */
const reply = (text) => ({ content: [{ type: /** @type {const} */ ('text'), text }] })

// The server reports the package's own version, so a release can't drift.
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const server = new McpServer({ name: 'slingshot-brand', version })

server.registerTool(
  'brand_guide',
  {
    title: 'Read the Slingshot brand guide',
    description:
      'Without a topic, returns the router that says which guide to read for the task. With a topic, returns that guide: every rule with its reason.',
    inputSchema: { topic: z.enum(TOPICS).optional() },
  },
  async ({ topic }) => reply(topic ? await readGuide(topic) : await readRouter())
)

server.registerTool(
  'brand_tokens',
  {
    title: 'Get the Slingshot design tokens',
    description:
      'The brand values: colours, fonts, sizes and spacing, as JSON or as CSS custom properties.',
    inputSchema: { format: z.enum(['json', 'css']).default('json') },
  },
  async ({ format }) => {
    const tokens = await readTokens()
    return reply(format === 'css' ? tokensToCss(tokens) : JSON.stringify(tokens, null, 2))
  }
)

server.registerTool(
  'check_colors',
  {
    title: 'Check colours against the brand',
    description:
      'Finds every raw colour in a CSS, HTML or JSX snippet and says which are brand tokens written by hand and which are off-brand.',
    inputSchema: { text: z.string().describe('The code or markup to check.') },
  },
  async ({ text }) => {
    const findings = findColors(text, await readTokens())
    if (findings.length === 0) return reply('No raw colours found.')
    return reply(
      findings
        .map(({ line, value, token }) =>
          token
            ? `line ${line}: ${value} is ${token}; use var(--slingshot-color-${token})`
            : `line ${line}: ${value} is not a brand colour`
        )
        .join('\n')
    )
  }
)

await server.connect(new StdioServerTransport())
