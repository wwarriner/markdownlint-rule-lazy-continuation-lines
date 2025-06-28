/* eslint-disable max-statements */
/* eslint-disable no-inline-comments */
/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
// @ts-check
// @typescript-eslint/consistent-type-imports

("use strict");

const {
  filterByTypes,
  getDescendantsByType,
} = require("markdownlint-rule-helpers/micromark");
// LOGGING: const { logTokens } = require("./helpers/logging.cjs");

/**
 * @typedef {import("markdownlint").MicromarkToken} MicromarkToken
 * @typedef {import("markdownlint").RuleParams} RuleParams
 * @typedef {import("markdownlint").RuleOnError} RuleOnError
 * @typedef {import("markdownlint").FixInfo} FixInfo
 */

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

const States = Object.freeze({
  processing: "processing",
  waiting: "waiting",
});
/**
 *
 */
class ContentTokenProcessor {
  constructor(
    /** @type {RuleOnError} */ onError,
    /** @type {boolean} */ admonitionsEnabled
  ) {
    // Reusable.
    this.onError = onError;
    this.admonitionsEnabled = admonitionsEnabled;

    // Need resetting.
    this.withinAdmonition = false;
    this.admonitionContentColumn = 0;
    /** @type {keyof States} */ this.state = States.processing;
  }

  process(/** @type {MicromarkToken} */ contentToken) {
    const [paragraph] = contentToken.children;
    const childTokens = paragraph.children.filter(
      (token) => !["linePrefix", "listItemIndent"].includes(token.type)
    );
    this.reset();
    for (const childToken of childTokens) {
      this.processChildToken(contentToken, childToken);
    }
  }

  processChildToken(
    /** @type {MicromarkToken} */ contentToken,
    /** @type {MicromarkToken} */ childToken
  ) {
    const expectedStartColumn = contentToken.startColumn;
    if (
      this.state === States.processing &&
      this.isLazy(expectedStartColumn, childToken)
    ) {
      this.reportLazyToken(expectedStartColumn, childToken);
    }
    this.updateState(childToken);
    this.updateAdmonition(childToken);
  }

  updateState(/** @type {MicromarkToken} */ childToken) {
    if (ContentTokenProcessor.isLineEnding(childToken)) {
      this.state = States.processing;
    } else {
      this.state = States.waiting;
    }
  }

  updateAdmonition(/** @type {MicromarkToken} */ childToken) {
    if (this.admonitionsEnabled) {
      if (ContentTokenProcessor.isAdmonitionStart(childToken)) {
        this.enterAdmonition(childToken.startColumn);
      } else if (!this.continuesAdmonition(childToken)) {
        this.exitAdmonition();
      }
    }
  }

  enterAdmonition(/** @type {number} */ column) {
    this.admonitionContentColumn = column + 4;
    this.withinAdmonition = true;
  }

  continuesAdmonition(/** @type {MicromarkToken} */ childToken) {
    return (
      this.admonitionsEnabled &&
      this.withinAdmonition &&
      childToken.startColumn >= this.admonitionContentColumn
    );
  }

  exitAdmonition() {
    this.admonitionContentColumn = 0;
    this.withinAdmonition = false;
  }

  isLazy(
    /** @type {number} */ expectedStartColumn,
    /** @type {MicromarkToken} */ token
  ) {
    return (
      !this.continuesAdmonition(token) &&
      token.startColumn !== expectedStartColumn
    );
  }

  reportLazyToken(
    /** @type {number} */ expectedStartColumn,
    /** @type {MicromarkToken} */ childToken
  ) {
    const fixInfo = prepareFixInfo(
      childToken.startLine,
      childToken.startColumn,
      expectedStartColumn
    );
    const errInfo = prepareErrInfo(childToken, fixInfo);
    this.onError(errInfo);
  }

  reset() {
    this.exitAdmonition();
    this.state = States.processing;
  }

  static isAdmonitionStart(/** @type {MicromarkToken} */ token) {
    return token.text.startsWith("!!!");
  }

  static isLineEnding(/** @type {MicromarkToken} */ token) {
    return token.type === "lineEnding";
  }
}

/** @type import("markdownlint").Rule */
module.exports = {
  names: ["lazy-continuation-lines"],
  description: "Lazy continuation lines are not allowed",
  tags: ["wwarriner"],
  parser: "micromark",

  function: (
    /** @type {RuleParams} */ params,
    /** @type {RuleOnError} */ onError
  ) => {
    /**
     * 1. Get tokens.
     * 2. Filter to listTokens.
     * 3. Extract tokens of type "content".
     * 4. For each token of type "content", extract tokens of type "data".
     * 5. For each token of type "data", process (content,data) pair.
     */

    const { admonitions } = params.config;
    const { tokens } = params.parsers.micromark;
    const listTokens = filterByTypes(tokens, ["listOrdered", "listUnordered"]);
    /** @type {MicromarkToken[]} */ const listContentTokens = [];
    let toEvaluate = listTokens;
    while (toEvaluate.length > 0) {
      listContentTokens.push(...getDescendantsByType(toEvaluate, ["content"]));
      toEvaluate = getDescendantsByType(toEvaluate, ["blockQuote"]);
    }

    const contentTokenProcessor = new ContentTokenProcessor(
      onError,
      admonitions
    );
    for (const contentToken of listContentTokens) {
      contentTokenProcessor.process(contentToken);
    }
  },
};
