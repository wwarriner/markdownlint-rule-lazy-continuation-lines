// @ts-check

import assert from "node:assert";
import test from "node:test";
import lazyContinuationLines from "../lazy-continuation-lines.cjs";
import { main as cli2 } from "markdownlint-cli2";
import { applyFixes } from "markdownlint-cli2/markdownlint";
import { lint, readConfig } from "markdownlint-cli2/markdownlint/promise";
import jsoncParse from "markdownlint-cli2/parsers/jsonc";
import yamlParse from "markdownlint-cli2/parsers/yaml";

const violations = [
  "lazy-continuation-lines-violations.md:6:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:7:2 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:8:5 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:11:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:12:4 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:13:8 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:19:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:21:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:24:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:26:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:29:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:31:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:39:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:40:4 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: 'lazy']",
  "lazy-continuation-lines-violations.md:48:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: '**lazy**']",
  "lazy-continuation-lines-violations.md:55:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: '_lazy_']",
  "lazy-continuation-lines-violations.md:62:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: '[lazy](lazy)']",
  "lazy-continuation-lines-violations.md:69:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: '<lazy.md>']",
  "lazy-continuation-lines-violations.md:80:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: '![!lazy](lazy)']",
  "lazy-continuation-lines-violations.md:87:1 lazy-continuation-lines Lazy continuation lines are not allowed [Lazy continuation line: '`lazy`']",
];
const customRules = [lazyContinuationLines];
const paramsBase = {
  argv: ["lazy-continuation-lines-violations.md"],
  directory: "test",
  optionsOverride: {
    customRules,
  },
};

const getConfigTest = (config, parser) => async () => {
  const messages = [];
  const params = {
    ...paramsBase,
    logError: (message) => messages.push(message),
    optionsOverride: {
      ...paramsBase.optionsOverride,
      config: await readConfig(config, [parser]),
    },
  };
  assert.equal(await cli2(params), 1);
  assert.deepEqual(messages, [...violations]);
};
test(
  "violations, JSON configuration",
  getConfigTest("./test/config.json", jsoncParse)
);
test(
  "violations, YAML configuration",
  getConfigTest("./test/config.yaml", yamlParse)
);

const getFixesTest = (content, expected) => async () => {
  const results = await lint({
    strings: { content },
    customRules,
  });
  const actual = applyFixes(content, results.content);
  assert.equal(actual, expected);
};
const contents = [
  `- list item\nlazy\n    lazy\n`,
  `1. list item\nlazy\n    lazy\n`,
  `1. > list item\nlazy\n        lazy\n`,
  `> 1. list item\nlazy\n        lazy\n`,
  `> 1. > list item\nlazy\n        lazy\n`,
  `- list item\n\n  new paragraph\nlazy\n    lazy\n`,
  `- list item\n**lazy**\n`,
];
const expecteds = [
  `- list item\n  lazy\n  lazy\n`,
  `1. list item\n   lazy\n   lazy\n`,
  `1. > list item\n     lazy\n     lazy\n`,
  `> 1. list item\n     lazy\n     lazy\n`,
  `> 1. > list item\n       lazy\n       lazy\n`,
  `- list item\n\n  new paragraph\n  lazy\n  lazy\n`,
  `- list item\n  **lazy**\n`,
];
assert(contents.length === expecteds.length);
for (let index = 0; index < contents.length; index += 1) {
  test(
    "fixes for lazy indentation lines",
    getFixesTest(contents[index], expecteds[index])
  );
}

test("no issues in project files", async () => {
  const params = {
    argv: ["./test/lazy-continuation-lines.md"],
  };
  assert.equal(await cli2(params), 0);
});
