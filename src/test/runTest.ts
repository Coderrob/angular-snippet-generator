/**
 * Copyright (c) 2026 Robert Lindley
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { runTests } from "@vscode/test-electron";

/**
 * Creates the test configuration for VS Code extension tests.
 * @returns The test configuration object.
 */
const createTestConfig = () => {
  delete process.env.ELECTRON_RUN_AS_NODE;
  const extensionDevelopmentPath = path.resolve(__dirname, "../../");
  const extensionTestsPath = path.resolve(__dirname, "./suite/index");
  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "vscode-test-user-data-")
  );
  const extensionsDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "vscode-test-extensions-")
  );
  return {
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [
      `--user-data-dir=${userDataDir}`,
      `--extensions-dir=${extensionsDir}`,
    ],
  };
};

/**
 * Main entry point for running VS Code extension tests.
 */
async function main() {
  try {
    await runTests(createTestConfig());
  } catch (err) {
    console.error("Failed to run tests", err);
    process.exit(1);
  }
}

main();
