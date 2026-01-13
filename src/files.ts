/**
 * MIT License
 * Copyright (c) 2026 Rob "Coderrob" Lindley
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import fs from "node:fs";
import path from "node:path";

/** Supported file extensions for processing. */
export const SUPPORTED_EXTENSIONS = [".ts"] as const;

/**
 * Angular file suffixes for supported artifact types.
 * @see https://angular.dev/style-guide#file-structure-conventions
 */
export const ANGULAR_SUFFIXES: string[] = [
  ".component.ts",
  ".directive.ts",
  ".pipe.ts",
] as const;

/** Type for Angular file suffixes. */
export type AngularSuffix = (typeof ANGULAR_SUFFIXES)[number];

/**
 * File system abstraction interface for dependency injection.
 * Enables testing and alternative implementations.
 */
export interface FileSystemProvider {
  /**
   * Reads the contents of a file.
   * @param filePath - The path to read.
   * @returns The file contents or empty string on failure.
   */
  readFile(filePath: string): string;

  /**
   * Lists directory entries.
   * @param dirPath - The directory to list.
   * @returns Array of directory entries.
   */
  readDir(dirPath: string): fs.Dirent[];
}

/** Default file system implementation using Node.js fs module. */
export const defaultFileSystem: FileSystemProvider = {
  readFile: (filePath: string): string => {
    try {
      return fs.readFileSync(filePath, { encoding: "utf8", flag: "r" }) ?? "";
    } catch {
      return "";
    }
  },
  readDir: (dirPath: string): fs.Dirent[] =>
    fs.readdirSync(dirPath, { withFileTypes: true }),
};

/**
 * Checks if a file path has a supported extension.
 * @param filePath - The file path to check.
 * @returns True if the file has a supported extension.
 */
export const hasSupportedExtension = (filePath = ""): boolean =>
  !!filePath &&
  SUPPORTED_EXTENSIONS.includes(
    path
      .extname(filePath)
      .toLowerCase() as (typeof SUPPORTED_EXTENSIONS)[number]
  );

/**
 * Checks if a file path follows Angular naming conventions.
 * Supports components (.component.ts), directives (.directive.ts), and pipes (.pipe.ts).
 * @param filePath - The file path to check.
 * @returns True if the file matches an Angular naming pattern.
 */
export const isAngularFile = (filePath = ""): boolean => {
  const lowerPath = filePath.toLowerCase();
  return ANGULAR_SUFFIXES.some((suffix) => lowerPath.endsWith(suffix));
};

/**
 * Determines if a file is a supported Angular file.
 * @param filePath - The file path to validate.
 * @returns True if the file is a supported Angular file.
 */
export const isSupportedFile = (filePath = ""): boolean =>
  hasSupportedExtension(filePath) && isAngularFile(filePath);

/**
 * Reads file contents from the specified path.
 * @param filePath - The path to the file to read.
 * @param fileSystem - Optional file system provider for dependency injection.
 * @returns The file contents or empty string on failure.
 */
export const getFileContents = (
  filePath = "",
  fileSystem: FileSystemProvider = defaultFileSystem
): string => (filePath ? fileSystem.readFile(filePath) : "");

/**
 * Recursively collects supported component files from a directory.
 * @param dirPath - The directory path to traverse.
 * @param fileSystem - Optional file system provider for dependency injection.
 * @returns Array of file paths matching supported component criteria.
 * @throws Error if directory path is not provided.
 */
export const getSupportedFiles = (
  dirPath = "",
  fileSystem: FileSystemProvider = defaultFileSystem
): string[] => {
  if (!dirPath) {
    throw new Error("Directory path not provided.");
  }

  return fileSystem.readDir(dirPath).flatMap((dirent): string[] => {
    const filePath = path.join(dirPath, dirent.name);

    if (dirent.isDirectory()) {
      return getSupportedFiles(filePath, fileSystem);
    }

    return dirent.isFile() && isSupportedFile(filePath) ? [filePath] : [];
  });
};
