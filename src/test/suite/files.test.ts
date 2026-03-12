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
  getFileContents,
  getSupportedFiles,
  hasSupportedExtension,
  type IFileSystemProvider,
  isAngularFile,
  isSupportedFile,
} from "../../files";

const ROOT_DIR = "/root";
const EXPECTED_FILE_COUNT = 2;

const EXTENSION_CASES: [string | undefined, boolean, string][] = [
  ["/path/to/file.ts", true, "TypeScript file"],
  ["/path/to/file.TS", true, "uppercase TypeScript extension"],
  ["/path/to/file.js", false, "JavaScript file"],
  ["/path/to/file.tsx", false, "TSX file"],
  ["/path/to/file", false, "no extension"],
  ["", false, "empty string"],
  [undefined, false, "undefined"],
];

const ANGULAR_FILE_CASES: [string | undefined, boolean, string][] = [
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

const VALID_FILE_CASES: [string, string][] = [
  [String.raw`c:\some\path\some.component.ts`, "Windows path component"],
  ["/some/path/test.component.ts", "Unix path component"],
  ["/PATH/TEST.COMPONENT.TS", "uppercase component"],
  ["/some/path/highlight.directive.ts", "directive file"],
  ["/some/path/currency.pipe.ts", "pipe file"],
];

const INVALID_FILE_CASES: [string | undefined, string][] = [
  [String.raw`c:\some\path\some.module.ts`, "module file"],
  ["/some/path/index.ts", "plain TypeScript file"],
  ["/some/path/index.sass", "wrong extension"],
  ["/some/path/derp", "no extension"],
  ["", "empty string"],
  [undefined, "undefined"],
];

/**
 * Creates a mock Dirent representing a directory entry.
 * @param name - The name of the directory entry.
 * @returns A mock directory Dirent object.
 */
const createDirDirent = (name: string): fs.Dirent => ({
  name,
  isDirectory: () => true,
  isFile: () => false,
  isBlockDevice: () => false,
  isCharacterDevice: () => false,
  isSymbolicLink: () => false,
  isFIFO: () => false,
  isSocket: () => false,
  path: "",
  parentPath: "",
});

/**
 * Creates a mock Dirent representing a file entry.
 * @param name - The name of the file entry.
 * @returns A mock file Dirent object.
 */
const createFileDirent = (name: string): fs.Dirent => ({
  name,
  isDirectory: () => false,
  isFile: () => true,
  isBlockDevice: () => false,
  isCharacterDevice: () => false,
  isSymbolicLink: () => false,
  isFIFO: () => false,
  isSocket: () => false,
  path: "",
  parentPath: "",
});

/**
 * Creates a mock file system for recursive file discovery tests.
 * @returns A mock IFileSystemProvider.
 */
const createMockFs = (): IFileSystemProvider => ({
  readFile: () => "",
  readDir: (dirPath: string): fs.Dirent[] => {
    if (dirPath === ROOT_DIR) {
      return [
        createDirDirent("sub"),
        createFileDirent("test.component.ts"),
        createFileDirent("test.service.ts"),
      ];
    }
    if (dirPath.includes("sub")) {
      return [createFileDirent("nested.component.ts")];
    }
    return [];
  },
});

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

/**
 * Defines the core tests for getFileContents.
 */
const registerGetFileContentsCore = (): void => {
  test("should return file contents using file system provider", () => {
    const mockFs: IFileSystemProvider = {
      readFile: () => "mock content",
      readDir: () => [],
    };
    assert.strictEqual(
      getFileContents("/path/to/file", mockFs),
      "mock content"
    );
  });
  test("should return empty string for empty path", () => {
    const mockFs: IFileSystemProvider = {
      readFile: () => "not called",
      readDir: () => [],
    };
    assert.strictEqual(getFileContents("", mockFs), "");
  });
  test("should return empty string when file read fails", () => {
    const mockFs: IFileSystemProvider = {
      readFile: () => "",
      readDir: () => [],
    };
    assert.strictEqual(getFileContents("/nonexistent", mockFs), "");
  });
};

/**
 * Registers tests for getFileContents.
 */
const registerGetFileContentsTests = (): void => {
  suite("getFileContents", registerGetFileContentsCore);
};

/**
 * Defines basic tests for getSupportedFiles.
 */
const registerGetSupportedFilesBasicTests = (): void => {
  test("should throw error when directory path not provided", () => {
    assert.throws(() => getSupportedFiles(""), /Directory path not provided/);
  });
  test("should recursively find component files", () => {
    const result = getSupportedFiles(ROOT_DIR, createMockFs());
    assert.strictEqual(result.length, EXPECTED_FILE_COUNT);
    assert.ok(result.some((f) => f.includes("test.component.ts")));
    assert.ok(result.some((f) => f.includes("nested.component.ts")));
  });
  test("should return empty array for empty directory", () => {
    const mockFs: IFileSystemProvider = {
      readFile: () => "",
      readDir: () => [],
    };
    assert.deepStrictEqual(getSupportedFiles("/empty", mockFs), []);
  });
};

/**
 * Defines default filesystem tests for getSupportedFiles.
 */
const registerGetSupportedFilesDefaultFsTests = (): void => {
  test("should use default filesystem when no provider given", () => {
    const content = defaultFileSystem.readFile(__filename);
    assert.ok(typeof content === "string");
  });
  test("should use default filesystem readDir", () => {
    assert.ok(Array.isArray(defaultFileSystem.readDir(__dirname)));
  });
  test("should return empty string when file does not exist", () => {
    const content = defaultFileSystem.readFile(
      "/nonexistent/path/does/not/exist.ts"
    );
    assert.strictEqual(content, "");
  });
};

/**
 * Registers tests for getSupportedFiles.
 */
const registerGetSupportedFilesTests = (): void => {
  suite("getSupportedFiles", () => {
    registerGetSupportedFilesBasicTests();
    registerGetSupportedFilesDefaultFsTests();
  });
};

/**
 * Registers tests for hasSupportedExtension.
 */
const registerHasSupportedExtensionTests = (): void => {
  suite("hasSupportedExtension", () => {
    runBooleanTests(EXTENSION_CASES, hasSupportedExtension);
  });
};

/**
 * Registers tests for isAngularFile.
 */
const registerIsAngularFileTests = (): void => {
  suite("isAngularFile", () => {
    runBooleanTests(ANGULAR_FILE_CASES, isAngularFile);
  });
};

/**
 * Defines tests for isSupportedFile.
 */
const registerIsSupportedFileCore = (): void => {
  VALID_FILE_CASES.forEach(([input, description]) => {
    test(`should return true for ${description}`, () => {
      assert.strictEqual(isSupportedFile(input), true);
    });
  });
  INVALID_FILE_CASES.forEach(([input, description]) => {
    test(`should return false for ${description}`, () => {
      assert.strictEqual(isSupportedFile(input), false);
    });
  });
};

/**
 * Registers tests for isSupportedFile.
 */
const registerIsSupportedFileTests = (): void => {
  suite("isSupportedFile", registerIsSupportedFileCore);
};

suite("files", () => {
  registerGetFileContentsTests();
  registerGetSupportedFilesTests();
  registerHasSupportedExtensionTests();
  registerIsAngularFileTests();
  registerIsSupportedFileTests();
});
