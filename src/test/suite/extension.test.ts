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

import * as assert from "node:assert";

import { mergeSnippet } from "../../extension";

const SNIPPET_KEY = "New Snippet";
const SNIPPET_FIXTURE = {
  [SNIPPET_KEY]: {
    body: ["new"],
    description: "test",
    prefix: ["prefix"],
    scope: "html",
  },
};

const ACCUMULATED_FIXTURE = { existing: { body: ["test"] } };

/**
 * Defines tests for the mergeSnippet function.
 */
const registerMergeSnippetCore = (): void => {
  test("should merge snippet into accumulated object", () => {
    const result = mergeSnippet(ACCUMULATED_FIXTURE, SNIPPET_FIXTURE);
    assert.deepStrictEqual(result, {
      ...ACCUMULATED_FIXTURE,
      ...SNIPPET_FIXTURE,
    });
  });
  test("should return accumulated when snippet is undefined", () => {
    assert.deepStrictEqual(
      mergeSnippet(ACCUMULATED_FIXTURE, undefined),
      ACCUMULATED_FIXTURE
    );
  });
  test("should handle empty accumulated object", () => {
    assert.deepStrictEqual(mergeSnippet({}, SNIPPET_FIXTURE), SNIPPET_FIXTURE);
  });
};

/**
 * Registers tests for the mergeSnippet function.
 */
const registerMergeSnippetTests = (): void => {
  suite("mergeSnippet", registerMergeSnippetCore);
};

suite("extension", () => {
  registerMergeSnippetTests();
});
