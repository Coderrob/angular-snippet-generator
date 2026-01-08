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

/**
 * Capitalizes the first character of a string while preserving the rest.
 * Does not scan for the first non-whitespace character.
 * @param value - The string to transform.
 * @returns The string with its first character capitalized, or the original value if empty/falsy.
 */
export const upperCaseFirstCharacter = (value = ""): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

/**
 * Converts a kebab-cased string to title case.
 * Replaces hyphens with spaces and capitalizes the first letter of each word.
 * @param value - The kebab-cased string to convert.
 * @returns The title-cased string with hyphens replaced by spaces.
 */
export const kebabToTitleCase = (value = ""): string =>
  value
    .trim()
    .split("-")
    .filter(Boolean)
    .map(upperCaseFirstCharacter)
    .join(" ");
