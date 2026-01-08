import * as path from "node:path";

import { globSync } from "glob";
import Mocha from "mocha";

/**
 * Test runner function for VS Code extension tests.
 * @returns Promise that resolves when tests complete.
 */
export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "..");

  const files = globSync("**/**.test.js", { cwd: testsRoot });
  files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

  return new Promise((resolve, reject) => {
    try {
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
