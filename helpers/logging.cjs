/* eslint-disable no-inline-comments */
/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
// @ts-check
// @typescript-eslint/consistent-type-imports

/**
 * @typedef {import("markdownlint").MicromarkToken} MicromarkToken
 * @typedef {import("markdownlint").RuleParams} RuleParams
 * @typedef {import("markdownlint").RuleOnError} RuleOnError
 * @typedef {import("markdownlint").FixInfo} FixInfo
 */

("use strict");

/**
 * General purpose helper function to recursively traverse a parser token tree
 * using a DFS approach.
 *
 * Parameters:
 * - mapFn: Function applied to every token prior to recursion. Also receives
 *   sharedArgs to carry state along. Must return nothing. Default no-op.
 * - sharedArgsUpdateFn: Function applied after mapFn and just prior to
 *   recursion on each child. Useful for once-per-child updates prior to
 *   recursion. Must return sharedArgs. Default returns unmodified input.
 * - stopRecursionFn: Function applied after mapFn but before iteration on
 *   children. Receives token and sharedArgs. Must return bool. If true is
 *   returned, the current traverseObject call returns prior to recursion.
 *   Default always returns false.
 * - sharedArgs: Any object used to assist passing state to recursive calls.
 *   Default empty object.
 * - visited: Collection of visited objects. Recommended to leave as default, a
 *   new empty Set() object. Supplying this argument can allow calls to avoid
 *   specified tokens.
 *
 * @template T
 * @param {MicromarkToken} token
 * @param {{
 *  mapFn?: (token: MicromarkToken, sharedArgs: T) => void,
 *  sharedArgsUpdateFn?: (sharedArgs: T) => T,
 *  stopRecursionFn?: (token: MicromarkToken, sharedArgs: T) => boolean
 *  sharedArgs?: T
 *  visited?: Set
 * }} params
 */
const traverseTokenTree = (
  token,
  {
    mapFn = (_token, _sharedArgs) => {
      /* No-op */
    },
    sharedArgsUpdateFn = (sharedArgs) => sharedArgs,
    stopRecursionFn = (_token, _sharedArgs) => false,
    sharedArgs = /** @type {T} */ ({}),
    visited = new Set(),
  }
) => {
  if (visited.has(token)) {
    return;
  }

  visited.add(token);
  mapFn(token, sharedArgs);

  if (stopRecursionFn(token, sharedArgs)) {
    return;
  }

  for (const child of token.children) {
    traverseTokenTree(child, {
      mapFn,
      sharedArgsUpdateFn,
      stopRecursionFn,
      sharedArgs: sharedArgsUpdateFn(sharedArgs),
      visited,
    });
  }
};

/**
 * Logging function.
 */
const logToken = (/** @type {MicromarkToken} */ token) => {
  traverseTokenTree(token, {
    mapFn: (token_, sharedArgs) => {
      let msg = `${
        " ".repeat(sharedArgs.indent) + token_.startLine.toString()
      }: ${token_.type} ${token_.startColumn}`;
      if (
        ![
          "blockQuote",
          "content",
          "paragraph",
          "lineEnding",
          "listItemIndent",
          "listOrdered",
          "listUnordered",
          "listItemPrefixWhitespace",
          "linePrefix",
          "lineEndingBlank",
        ].includes(token_.type)
      ) {
        let { text } = token_;
        text = text.replace("\n", `\\n`);
        msg += ` "${text}"`;
      }
      // eslint-disable-next-line no-undef, no-console
      console.log(msg);
    },
    sharedArgsUpdateFn: (sharedArgs) => ({
      ...sharedArgs,
      indent: sharedArgs.indent + 2,
    }),
    sharedArgs: { indent: 0 },
  });
};

/**
 * @param {MicromarkToken[]} tokens
 * @param {string} blockName
 */
const logTokens = (tokens, blockName) => {
  const pre = blockName;
  const post = `${blockName} END\n`;

  // eslint-disable-next-line no-console, no-undef
  console.log(pre);

  tokens.map((token, _index, _array) => logToken(token));

  // eslint-disable-next-line no-console, no-undef
  console.log(post);
};

module.exports = {
  logTokens,
};
