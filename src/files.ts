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
