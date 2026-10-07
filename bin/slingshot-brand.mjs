#!/usr/bin/env node
// @ts-check
// slingshot-brand: read the Slingshot kit and check work against it.

import { readFile, writeFile } from 'node:fs/promises'

import {
  findColors,
  readGuide,
  readRouter,
  readTokens,
  tokensToCss,
  TOPICS,
} from '../src/kit.mjs'

const USAGE = `Usage:
  slingshot-brand guide [topic]       print the router, or one guide (${TOPICS.join(', ')})
  slingshot-brand tokens [--out file] print tokens.css, or write it to a file
  slingshot-brand check <files...>    flag raw colours in files; exits 1 on any off-brand colour`

const [command, ...args] = process.argv.slice(2)

if (command === 'guide') {
  const topic = args[0]
  // SAFETY: readGuide validates the topic and throws a readable error.
  const text = topic
    ? await readGuide(/** @type {import('../src/kit.mjs').Topic} */ (topic))
    : await readRouter()
  process.stdout.write(text)
} else if (command === 'tokens') {
  const css = tokensToCss(await readTokens())
  const out = args.indexOf('--out')
  if (out !== -1 && args[out + 1]) {
    await writeFile(args[out + 1], css)
    console.error(`Wrote ${args[out + 1]}`)
  } else {
    process.stdout.write(css)
  }
} else if (command === 'check' && args.length > 0) {
  const tokens = await readTokens()
  let offBrand = 0
  for (const file of args) {
    const findings = findColors(await readFile(file, 'utf8'), tokens)
    for (const { line, value, token } of findings) {
      if (token) {
        console.log(`${file}:${line}  ${value}  is ${token}: use var(--slingshot-color-${token})`)
      } else {
        offBrand += 1
        console.log(`${file}:${line}  ${value}  is not a brand colour`)
      }
    }
  }
  if (offBrand > 0) {
    console.log(`\n${offBrand} off-brand colour${offBrand === 1 ? '' : 's'}. See brand/color.md.`)
    process.exitCode = 1
  }
} else {
  console.log(USAGE)
  process.exitCode = command ? 1 : 0
}
