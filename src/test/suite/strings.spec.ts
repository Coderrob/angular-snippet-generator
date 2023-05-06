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

import assert from 'assert';
import * as strings from '../../strings';

suite('strings tests', () => {
  suite('kebabToTitleCase', () => {
    test('should convert kebab cased string to a title format', () => {
      assert.strictEqual(
        strings.kebabToTitleCase('fancy-button-menu'),
        'Fancy Button Menu'
      );
    });

    test('should return empty if the string is undefined', () => {
      assert.strictEqual(strings.kebabToTitleCase(undefined), '');
    });

    test('should return a capital letter if string only one character in length', () => {
      assert.strictEqual(strings.kebabToTitleCase('a'), 'A');
    });

    test('should return empty string if string only whitespace characters', () => {
      assert.strictEqual(strings.kebabToTitleCase('    '), '');
    });
  });

  suite('upperCaseFirstCharacter', () => {
    test('should return empty string if undefined value received', () => {
      assert.strictEqual(strings.upperCaseFirstCharacter(undefined), '');
    });

    test('should uppercase a single character string', () => {
      assert.strictEqual(strings.upperCaseFirstCharacter('a'), 'A');
    });

    test('should uppercase the first character of a word', () => {
      assert.strictEqual(
        strings.upperCaseFirstCharacter('aardvark'),
        'Aardvark'
      );
    });

    test('should only uppercase the first word found in a string', () => {
      assert.strictEqual(
        strings.upperCaseFirstCharacter('greedy narwhal'),
        'Greedy narwhal'
      );
    });

    test('should handle empty string', () => {
      assert.strictEqual(strings.upperCaseFirstCharacter('  '), '  ');
    });
  });
});
