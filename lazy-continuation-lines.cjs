/* eslint-disable max-lines-per-function */
/* eslint-disable capitalized-comments */
/* eslint-disable max-statements */
/* eslint-disable no-inline-comments */
/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
// @ts-check
// @typescript-eslint/consistent-type-imports

("use strict");

/**
 * @typedef {import("markdownlint").MicromarkToken} MicromarkToken
 * @typedef {import("markdownlint").RuleParams} RuleParams
 * @typedef {import("markdownlint").FixInfo} FixInfo
 */

/**
 * Returns true if the input token is a list.
 */
const isList = (/** @type {MicromarkToken} */ token) =>
  ["listOrdered", "listUnordered"].includes(token.type);

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
// const logToken = (/** @type {MicromarkToken} */ token) => {
//   traverseTokenTree(token, {
//     mapFn: (token_, sharedArgs) => {
//       // eslint-disable-next-line no-console, no-undef
//       console.log(
//         `${" ".repeat(sharedArgs.indent) + token_.startLine.toString()}: ${
//           token_.type
//         } ${token_.startColumn}`
//       );
//     },
//     sharedArgsUpdateFn: (sharedArgs) => ({
//       ...sharedArgs,
//       indent: sharedArgs.indent + 2,
//     }),
//     sharedArgs: { indent: 0 },
//   });
// };

/**
 * @param {MicromarkToken[]} tokens
 * @param {{
 *  pre?: string,
 *  post?: string,
 * }} params
 */
// const logTokens = (tokens, { pre = "BLOCK", post }) => {
//   let realizedPost = post === undefined ? `${pre}` : `${post}`;
//   realizedPost += ` END\n`;

//   // eslint-disable-next-line no-console, no-undef
//   console.log(pre);

//   tokens.map((token, _index, _array) => logToken(token));

//   // eslint-disable-next-line no-console, no-undef
//   console.log(realizedPost);
// };

/**
 * General purpose helper function to recursively traverse a parser token tree
 * using a DFS approach to get a list of tokens matching the input types. Stops recursion on encountering a list.
 *
 * Parameters:
 * - token: MicromarkToken
 * - types: MicroMarkToken types to record for output.
 *
 * @param {MicromarkToken} token
 * @param {{
 *  includedTypes?: string[],
 *  ignoredTypes?: string[],
 *  stopRecursionFn?: (token: MicromarkToken, sharedArgs: {extractedTokens: MicromarkToken[]}) => boolean
 * }} params
 */
const extractChildrenWithTypes = (
  token,
  {
    includedTypes,
    ignoredTypes,
    stopRecursionFn = (_token, _sharedArgs) => false,
  }
) => {
  /**
   * @type {{extractedTokens: MicromarkToken[]}}
   */
  const sharedArgs = { extractedTokens: [] };
  traverseTokenTree(token, {
    mapFn: (token_, sharedArgs_) => {
      const included =
        includedTypes === undefined
          ? true
          : includedTypes.includes(token_.type);
      const ignored =
        ignoredTypes === undefined ? false : ignoredTypes.includes(token_.type);
      if (included && !ignored) {
        sharedArgs_.extractedTokens.push(token_);
      }
    },
    stopRecursionFn,
    sharedArgs,
  });
  return sharedArgs.extractedTokens;
};

/**
 * Prepares the fixInfo object for use with the errInfo object and onError().
 *
 * @returns {FixInfo}
 */
const prepareFixInfo = (
  /** @type {number} */ lineNumber,
  /** @type {number} */ actualStartColumn,
  /** @type {number} */ expectedStartColumn
) => {
  const fixInfo = {
    lineNumber,
    editColumn: actualStartColumn,
  };

  const diff = expectedStartColumn - actualStartColumn;
  if (diff > 0) {
    fixInfo.insertText = " ".repeat(diff);
  } else {
    fixInfo.editColumn = 1;
    fixInfo.deleteCount = -diff;
  }

  return fixInfo;
};

/**
 * Prepares the errInfo object for use with onError().
 *
 * @returns {{
 *  lineNumber: number,
 *  detail: string,
 *  range: number[],
 *  fixInfo: FixInfo,
 * }}
 */
const prepareErrInfo = (
  /** @type {MicromarkToken} */ dataToken,
  /** @type {FixInfo} */ fixInfo
) => ({
  lineNumber: dataToken.startLine,
  detail: `Lazy continuation line: '${dataToken.text}'`,
  range: [
    dataToken.startColumn,
    dataToken.endColumn - dataToken.startColumn - 1,
  ],
  fixInfo,
});

/** @type import("markdownlint").Rule */
module.exports = {
  names: ["lazy-continuation-lines"],
  description: "Lazy continuation lines are not allowed",
  tags: ["wwarriner"],
  parser: "micromark",

  function:
    /**
     * @param {RuleParams} params
     */
    (params, onError) => {
      /**
       * 1. Get tokens.
       * 2. Filter to listTokens.
       * 3. Extract tokens of type "content".
       * 4. For each token of type "content", extract tokens of type "data".
       * 5. For each token of type "data", process (content,data) pair.
       */

      const { tokens } = params.parsers.micromark;
      //A logTokens(tokens, { pre: "ALL TOKENS" });

      const listTokens = tokens
        .map((token) =>
          extractChildrenWithTypes(token, {
            includedTypes: ["listOrdered", "listUnordered"],
            stopRecursionFn: (token_, _sharedArgs) => isList(token_),
          })
        )
        .flat();
      //A logTokens(listTokens, { pre: "LIST TOKENS" });

      const listChildTokens = listTokens.map((token) => token.children).flat();

      const contentTokens = listChildTokens
        .map((token) =>
          extractChildrenWithTypes(token, { includedTypes: ["content"] })
        )
        .flat();
      //A logTokens(contentTokens, { pre: "CONTENT TOKENS" });

      for (const contentToken of contentTokens) {
        const [paragraph] = contentToken.children;
        const childTokens = paragraph.children.filter(
          (token) => !["linePrefix", "listItemIndent"].includes(token.type)
        );
        let newlineEncountered = true;
        for (const token of childTokens) {
          if (newlineEncountered) {
            if (token.startColumn !== contentToken.startColumn) {
              const fixInfo = prepareFixInfo(
                token.startLine,
                token.startColumn,
                contentToken.startColumn
              );
              const errInfo = prepareErrInfo(token, fixInfo);
              onError(errInfo);
            }
          }
          newlineEncountered = ["lineEnding"].includes(token.type);
        }
      }
    },
};
