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

import assert from "node:assert";
import fs from "node:fs";

import {
  defaultFileSystem,
  type FileSystemProvider,
  getFileContents,
  getSupportedFiles,
  hasSupportedExtension,
  isAngularFile,
  isSupportedFile,
} from "../../files";

/**
 * Runs parameterized tests for boolean predicate functions.
 * @param cases - Array of [input, expected, description] tuples.
 * @param fn - The function under test.
 */
const runBooleanTests = <T>(
  cases: [T, boolean, string][],
  fn: (input: T) => boolean
): void => {
  cases.forEach(([input, expected, description]) => {
    test(`should return ${expected} for ${description}`, () => {
      assert.strictEqual(fn(input), expected);
    });
  });
};

suite("files", () => {
  suite("hasSupportedExtension", () => {
    const cases: [string | undefined, boolean, string][] = [
      ["/path/to/file.ts", true, "TypeScript file"],
      ["/path/to/file.TS", true, "uppercase TypeScript extension"],
      ["/path/to/file.js", false, "JavaScript file"],
      ["/path/to/file.tsx", false, "TSX file"],
      ["/path/to/file", false, "no extension"],
      ["", false, "empty string"],
      [undefined, false, "undefined"],
    ];

    runBooleanTests(cases, hasSupportedExtension);
  });

  suite("isAngularFile", () => {
    const cases: [string | undefined, boolean, string][] = [
      ["/path/test.component.ts", true, "component file"],
      ["/path/TEST.COMPONENT.TS", true, "uppercase component file"],
      ["/path/my-button.component.ts", true, "kebab-case component"],
      ["/path/highlight.directive.ts", true, "directive file"],
      ["/path/HIGHLIGHT.DIRECTIVE.TS", true, "uppercase directive file"],
      ["/path/currency.pipe.ts", true, "pipe file"],
      ["/path/CURRENCY.PIPE.TS", true, "uppercase pipe file"],
      ["/path/test.module.ts", false, "module file"],
      ["/path/test.service.ts", false, "service file"],
      ["/path/test.ts", false, "plain TypeScript file"],
      ["", false, "empty string"],
      [undefined, false, "undefined"],
    ];

    runBooleanTests(cases, isAngularFile);
  });

  suite("isSupportedFile", () => {
    const validCases: [string, string][] = [
      [String.raw`c:\some\path\some.component.ts`, "Windows path component"],
      ["/some/path/test.component.ts", "Unix path component"],
      ["/PATH/TEST.COMPONENT.TS", "uppercase component"],
      ["/some/path/highlight.directive.ts", "directive file"],
      ["/some/path/currency.pipe.ts", "pipe file"],
    ];

    validCases.forEach(([input, description]) => {
      test(`should return true for ${description}`, () => {
        assert.strictEqual(isSupportedFile(input), true);
      });
    });

    const invalidCases: [string | undefined, string][] = [
      [String.raw`c:\some\path\some.module.ts`, "module file"],
      ["/some/path/index.ts", "plain TypeScript file"],
      ["/some/path/index.sass", "wrong extension"],
      ["/some/path/derp", "no extension"],
      ["", "empty string"],
      [undefined, "undefined"],
    ];

    invalidCases.forEach(([input, description]) => {
      test(`should return false for ${description}`, () => {
        assert.strictEqual(isSupportedFile(input), false);
      });
    });
  });

  suite("getFileContents", () => {
    test("should return file contents using file system provider", () => {
      const mockFs: FileSystemProvider = {
        readFile: () => "mock content",
        readDir: () => [],
      };
      assert.strictEqual(
        getFileContents("/path/to/file", mockFs),
        "mock content"
      );
    });

    test("should return empty string for empty path", () => {
      const mockFs: FileSystemProvider = {
        readFile: () => "should not be called",
        readDir: () => [],
      };
      assert.strictEqual(getFileContents("", mockFs), "");
    });

    test("should return empty string when file read fails", () => {
      const mockFs: FileSystemProvider = {
        readFile: () => "",
        readDir: () => [],
      };
      assert.strictEqual(getFileContents("/nonexistent", mockFs), "");
    });
  });

  suite("getSupportedFiles", () => {
    /**
     * Creates a mock Dirent object for testing.
     * @param name - The name of the directory entry.
     * @param isDir - Whether the entry is a directory.
     * @returns A mock Dirent object.
     */
    const createMockDirent = (name: string, isDir: boolean): fs.Dirent => ({
      name,
      isDirectory: () => isDir,
      isFile: () => !isDir,
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isSymbolicLink: () => false,
      isFIFO: () => false,
      isSocket: () => false,
      path: "",
      parentPath: "",
    });

    test("should throw error when directory path not provided", () => {
      assert.throws(() => getSupportedFiles(""), /Directory path not provided/);
    });

    test("should recursively find component files", () => {
      const mockFs: FileSystemProvider = {
        readFile: () => "",
        readDir: (dirPath: string): fs.Dirent[] => {
          if (dirPath === "/root") {
            return [
              createMockDirent("sub", true),
              createMockDirent("test.component.ts", false),
              createMockDirent("test.service.ts", false),
            ];
          }
          if (dirPath.includes("sub")) {
            return [createMockDirent("nested.component.ts", false)];
          }
          return [];
        },
      };

      const result = getSupportedFiles("/root", mockFs);
      assert.strictEqual(result.length, 2);
      assert.ok(result.some((f) => f.includes("test.component.ts")));
      assert.ok(result.some((f) => f.includes("nested.component.ts")));
    });

    test("should return empty array for empty directory", () => {
      const mockFs: FileSystemProvider = {
        readFile: () => "",
        readDir: () => [],
      };
      const result = getSupportedFiles("/empty", mockFs);
      assert.deepStrictEqual(result, []);
    });

    test("should use default filesystem when no provider given", () => {
      // Test that defaultFileSystem is used - trigger readFile
      const content = defaultFileSystem.readFile(__filename);
      assert.ok(typeof content === "string");
    });

    test("should use default filesystem readDir", () => {
      // Test that defaultFileSystem readDir works
      const entries = defaultFileSystem.readDir(__dirname);
      assert.ok(Array.isArray(entries));
    });

    test("should return empty string when file does not exist", () => {
      // Test the catch block in defaultFileSystem.readFile
      const content = defaultFileSystem.readFile(
        "/nonexistent/path/that/does/not/exist.ts"
      );
      assert.strictEqual(content, "");
    });
  });
});
