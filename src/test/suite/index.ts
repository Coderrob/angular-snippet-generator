import * as path from "node:path";

import { globSync } from "glob";
import Mocha from "mocha";

/**
 * Loads test files from the test root into a mocha instance.
 * @param mocha - The mocha instance.
 * @param testsRoot - The root directory for test discovery.
 */
const loadTestFiles = (mocha: Mocha, testsRoot: string): void => {
  const files = globSync("**/**.test.js", { cwd: testsRoot });
  for (const f of files) {
    mocha.addFile(path.resolve(testsRoot, f));
  }
};

/**
 * Test runner function for VS Code extension tests.
 * @returns Promise that resolves when tests complete.
 */
export function run(): Promise<void> {
  const mocha = new Mocha({ ui: "tdd", color: true });
  const testsRoot = path.resolve(__dirname, "..");
  loadTestFiles(mocha, testsRoot);
  return new Promise((resolve, reject) => runMocha(mocha, resolve, reject));
}

/**
 * Runs mocha and resolves or rejects based on test results.
 * @param mocha - The mocha instance.
 * @param resolve - Promise resolve callback.
 * @param reject - Promise reject callback.
 */
const runMocha = (
  mocha: Mocha,
  resolve: () => void,
  reject: (err: Error) => void
): void => {
  /**
   * Handles mocha run completion.
   * @param failures - Number of test failures.
   */
  const onComplete = (failures: number): void => {
    if (failures > 0) {
      reject(new Error(`${failures} tests failed.`));
    } else {
      resolve();
    }
  };
  mocha.run(onComplete);
};
