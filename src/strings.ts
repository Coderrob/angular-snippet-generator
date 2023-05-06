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

/**
 * Upper case the first character of the string.
 *
 * Note: This function will not scan for the first
 * non-whitespace character to uppercase.
 * @param value
 * @returns
 */
export function upperCaseFirstCharacter(value = ''): string {
  if (!value) {
    return value;
  }
  const firstCharacter = value.charAt(0).toUpperCase();
  return [firstCharacter, value.slice(1)].filter(Boolean).join('');
}

/**
 * Converts a kebab cased string to title cased words.
 *
 * Note: This will convert any word within the string into
 * a title cased word.
 * @param value - The kebab cased string to convert to a snippet title.
 * @returns The formatted title of a kebab cased string with
 * '-' replaced with ' ' and the first character of each word capitalized.
 */
export function kebabToTitleCase(value: string = ''): string {
  return value
    .trim()
    .replace('-', ' ')
    .split(' ')
    .map(upperCaseFirstCharacter)
    .join(' ');
}
