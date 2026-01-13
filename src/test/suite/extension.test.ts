/* eslint-disable @typescript-eslint/naming-convention */
/**
 * MIT License
 * Copyright (c) 2026 Rob "Coderrob" Lindley
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
