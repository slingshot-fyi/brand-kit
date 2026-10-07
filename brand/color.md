# Colour

Ink on paper, with one quiet grey. The values are in `tokens.json`.

| Token | Use |
| --- | --- |
| `paper` | Page background. |
| `ink` | Text, the mark, rules. |
| `stone` | Quiet text: labels, captions, secondary lines. |
| `surface` | Panels a shade darker than the page. |
| `line` | Hairline rules between rows. |

## Rules

- **Use only the tokens, never a raw colour value.** Because a retune changes the token once, and a hard-coded value stays behind on the old colour.
- **Keep the page paper and the text ink.** Because the brand reads as a document, and contrast this high works for every reader.
- **Use no accent colour.** Because an accent would compete with the content, which is the only thing a Slingshot page asks you to look at.
- **Use stone only for text that can be skipped.** Because stone is the one step down from ink, and using it for main copy flattens the hierarchy.
- **Keep text at WCAG AA contrast or better (4.5:1).** Because stone on paper is about 5:1 and stays readable; lighter greys do not.
