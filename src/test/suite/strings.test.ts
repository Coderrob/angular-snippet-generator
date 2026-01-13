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
