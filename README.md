# Slingshot brand kit

Slingshot's own brand, built as an agentic brand system: the same parts the company builds for others, used on itself first. It is the brand behind [slingshot.fyi](https://slingshot.fyi).

| Part | What it is |
| --- | --- |
| Kit | `brand/`: a router (`readme.md`) and five guides (voice, layout, typography, colour, mark). Every rule carries its reason, so a person or an agent can apply it to a case nobody wrote down. |
| Tokens | `brand/tokens.json` holds every value once; `dist/tokens.css` is generated from it. |
| CLI | `slingshot-brand` prints the guides and tokens, and checks files for colours that are not brand tokens. |
| MCP | `slingshot-brand-mcp` gives any MCP client (Claude Code, Claude Desktop, Cursor) the guides, the tokens and the colour check while it works. |

## Use it

```bash
npx -p @slingshot-fyi/brand-kit slingshot-brand guide            # which guide to read for the task
npx -p @slingshot-fyi/brand-kit slingshot-brand guide voice      # one guide
npx -p @slingshot-fyi/brand-kit slingshot-brand tokens           # tokens as CSS custom properties
npx -p @slingshot-fyi/brand-kit slingshot-brand check src/*.css  # exits 1 if any colour is off-brand
```

In a clone of this repository, run `npm install` once and the same commands work as `npx slingshot-brand …`.

Add the MCP server to Claude Code:

```bash
claude mcp add slingshot-brand -- npx -y @slingshot-fyi/brand-kit
```

It exposes three tools: `brand_guide`, `brand_tokens` and `check_colors`.

## How it is tested

`npm test` checks that every rule has a reason, that the generated CSS covers every token, that the colour check names brand colours and flags the rest, and starts the MCP server to call each tool over stdio.

The kit itself is tested the way Slingshot tests every kit: hand it to a fresh agent with no other context, ask it to make something new, and treat every guess it makes as a missing rule.

## Fonts

The statement face, Exposure, is licensed separately and is not in this repository. Geist and Geist Mono are under the SIL Open Font License.

## Licence

The code is MIT (see `LICENSE`). The Slingshot name, mark and copy belong to Slingshot.
