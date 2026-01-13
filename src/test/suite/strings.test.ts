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

import assert from "node:assert";

import { kebabToTitleCase, upperCaseFirstCharacter } from "../../strings";

suite("strings", () => {
  suite("upperCaseFirstCharacter", () => {
    const cases: [string | undefined, string, string][] = [
      ["a", "A", "single lowercase letter"],
      ["aardvark", "Aardvark", "lowercase word"],
      ["greedy narwhal", "Greedy narwhal", "phrase with spaces"],
      ["ABC", "ABC", "already uppercase"],
      ["123abc", "123abc", "starting with number"],
      [undefined, "", "undefined input"],
      ["", "", "empty string"],
      ["  ", "  ", "whitespace-only string"],
    ];

    cases.forEach(([input, expected, description]) => {
      test(`should ${description.includes("uppercase") || description.includes("capitalize") ? "capitalize" : "handle"} ${description}`, () => {
        assert.strictEqual(upperCaseFirstCharacter(input), expected);
      });
    });
  });

  suite("kebabToTitleCase", () => {
    const cases: [string | undefined, string, string][] = [
      ["fancy-button-menu", "Fancy Button Menu", "standard kebab case"],
      ["save-cancel-button", "Save Cancel Button", "three word kebab"],
      ["a", "A", "single character"],
      ["simple", "Simple", "single word without hyphens"],
      ["a-b-c", "A B C", "single character segments"],
      [undefined, "", "undefined input"],
      ["", "", "empty string"],
      ["    ", "", "whitespace-only string"],
      ["--", "", "only hyphens"],
      ["  spaced  ", "Spaced", "trimmed input with internal content"],
    ];

    cases.forEach(([input, expected, description]) => {
      test(`should ${description.includes("kebab") || description.includes("word") ? "convert" : "handle"} ${description}`, () => {
        assert.strictEqual(kebabToTitleCase(input), expected);
      });
    });
  });
});
