/* eslint-disable @typescript-eslint/naming-convention */
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

suite("extension", () => {
  suite("mergeSnippet", () => {
    test("should merge snippet into accumulated object", () => {
      const accumulated = { existing: { body: ["test"] } };
      const snippet = {
        "New Snippet": {
          body: ["new"],
          description: "test",
          prefix: ["prefix"],
          scope: "html",
        },
      };
      const result = mergeSnippet(accumulated, snippet);
      assert.deepStrictEqual(result, { ...accumulated, ...snippet });
    });

    test("should return accumulated when snippet is undefined", () => {
      const accumulated = { existing: { body: ["test"] } };
      const result = mergeSnippet(accumulated, undefined);
      assert.deepStrictEqual(result, accumulated);
    });

    test("should handle empty accumulated object", () => {
      const snippet = {
        "New Snippet": {
          body: ["new"],
          description: "test",
          prefix: ["prefix"],
          scope: "html",
        },
      };
      const result = mergeSnippet({}, snippet);
      assert.deepStrictEqual(result, snippet);
    });
  });
});
