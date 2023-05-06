/**
 * MIT License
 * Copyright (c) 2023 Rob "Coderrob" Lindley
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

import fs from 'fs';
import path from 'path';

export const SUPPORTED_EXTENSIONS: string[] = ['.ts'];
/**
 * Per Angular naming convention a component should
 * have a file named with a .component.ts suffix.
 *
 * https://angular.io/guide/styleguide#file-structure-conventions
 */
export const COMPONENT_SUFFIX: string = '.component.ts';

/**
 * @param {string} [path=""] - The path to a file to read and return the
 * file data from.
 * @returns {(string)} The contents of the file found at the path provided;
 * otherwise will return empty string in the event of failure.
 */
export function getFileContents(filePath: string = ''): string {
  try {
    return fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }) ?? '';
  } catch (error) {
    console.error(`Failed to read file path provided; ${error}`);
    return '';
  }
}

/**
 * Returns a list of supported files found within the directory
 * path and within any of its sub-directories.
 * file extensions.
 * @param dir - The directory path to traverse looking
 * for any files matching the supported file extensions.
 * @returns {string[]} List of files found within the directory
 * structure that matched the list of supported file extensions.
 */
export function getSupportedFiles(dirPath: string = ''): string[] {
  if (!dirPath) {
    throw new Error('Directory path not provided.');
  }
  const files: string[] = [];
  fs.readdirSync(dirPath, { withFileTypes: true }).forEach((dirent) => {
    const filePath = path.join(dirPath, dirent.name);
    switch (true) {
      // Directory - iterate files within the directory its subdirectories
      case dirent.isDirectory():
        files.push(...getSupportedFiles(filePath));
        break;

      // File - process file if supported
      case dirent.isFile() && isSupportedFile(filePath):
        files.push(filePath);
        break;
    }
  });
  return files;
}

/**
 *
 * @param filePath
 * @returns
 */
export function isSupportedFile(filePath = ''): boolean {
  return hasSupportedExtension(filePath) && isComponentFile(filePath);
}

/**
 *
 * @param filePath
 * @returns
 */
export function isComponentFile(filePath = ''): boolean {
  return !!filePath?.toLowerCase().endsWith(COMPONENT_SUFFIX);
}

/**
 *
 * @param filePath
 * @returns
 */
export function hasSupportedExtension(filePath = ''): boolean {
  return (
    !!filePath &&
    SUPPORTED_EXTENSIONS.includes(path.extname(filePath)?.toLowerCase())
  );
}
