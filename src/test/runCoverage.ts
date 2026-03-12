/**
 * Standalone test runner for code coverage.
 * Runs tests without VS Code runtime for nyc coverage collection.
 */
import * as path from "node:path";

import { globSync } from "glob";
import Mocha from "mocha";

const mocha = new Mocha({ ui: "tdd", color: true });
const testsRoot = path.resolve(__dirname, "suite");

/**
 * Adds a test file to the mocha runner.
 * @param f - The test file name relative to testsRoot.
 */
const addTestFile = (f: string): void => {
  mocha.addFile(path.resolve(testsRoot, f));
};

/**
 * Determines if a test file should be included in the coverage run.
 * @param f - The test file name.
 * @returns True if the file is not an extension test.
 */
const isNotExtensionTest = (f: string): boolean =>
  !f.includes("extension.test");

/**
 * Handles the mocha run completion and sets the exit code.
 * @param failures - The number of test failures.
 */
const onRunComplete = (failures: number): void => {
  process.exitCode = failures ? 1 : 0;
};

const files = globSync("**/*.test.js", { cwd: testsRoot }).filter(
  isNotExtensionTest
);
files.forEach(addTestFile);
mocha.run(onRunComplete);
