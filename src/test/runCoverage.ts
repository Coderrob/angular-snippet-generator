/**
 * Standalone test runner for code coverage.
 * Runs tests without VS Code runtime for nyc coverage collection.
 */
import * as path from "node:path";

import { globSync } from "glob";
import Mocha from "mocha";

const mocha = new Mocha({
  ui: "tdd",
  color: true,
});

const testsRoot = path.resolve(__dirname, "suite");

// Find all test files except extension.test.js (requires VS Code API)
const files = globSync("**/*.test.js", { cwd: testsRoot }).filter(
  (f) => !f.includes("extension.test")
);

files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
