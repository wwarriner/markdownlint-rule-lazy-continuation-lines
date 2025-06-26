# markdownlint-rule-extended-ascii

> A markdownlint rule that rejects lazy continuation lines.

## Overview

This rule for the [Node.js markdownlint library][markdownlint] (and its
associated tools) rejects lazy continuation lines in [Markdown][markdown]
content.

This rule provides fix information for lazy continuation lines which can be used
by callers to fix instances automatically.

Based on <https://github.com/DavidAnson/markdownlint-rule-extended-ascii>.

## Lazy Continuation Lines

1. Are children of a list item token, defined to be the list item with the
   largest line number among preceding lines.
1. Have no blank lines between self and preceding content.
1. Have no leading list marker on the same line.
1. Start at a different column number than the starting column number of the
   content of the parent list item.

### Examples

```
- list item
lazy
  ok
    lazy

1. list item
lazy
  ok
    lazy

> 1. > list item
lazy
       ok
         lazy

- list item

  new paragraph of list item
lazy
  ok
    lazy
```

## Use

### Install

```bash
npm install https://github.com/wwarriner/markdownlint-rule-lazy-continuation-lines.git --save-dev
```

### Configure

If using [`markdownlint-cli`][markdownlint-cli]:

```bash
markdownlint --rules markdownlint-rule-lazy-continuation-lines *.md
```

If using [`markdownlint-cli2`][markdownlint-cli2] and a
`.markdownlint-cli2.jsonc` configuration file:

```json
{
    "customRules": [
        "markdownlint-rule-lazy-continuation-lines"
    ]
}
```

If using [`markdownlint-cli2`][markdownlint-cli2] and a
`.markdownlint-cli2.yaml` configuration file:

```yaml
customRules:
    - markdownlint-rule-lazy-continuation-lines
```

If using the [`markdownlint` extension for VS Code][vscode-markdownlint]:

*See the `markdownlint-cli2` examples above or refer to the extension
documentation*

[markdown]: https://en.wikipedia.org/wiki/Markdown
[markdownlint]: https://github.com/DavidAnson/markdownlint
[markdownlint-cli]: https://github.com/igorshubovych/markdownlint-cli
[markdownlint-cli2]: https://github.com/DavidAnson/markdownlint-cli2
[markdownlint-config]: https://github.com/DavidAnson/markdownlint?tab=readme-ov-file#optionsconfig
[vscode-markdownlint]: https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint
