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

/* eslint-disable @typescript-eslint/naming-convention */
import assert from "node:assert";

import {
  createSnippet,
  formatComponentName,
  formatToFunctionName,
  getTypeValues,
  propertyToAttribute,
  propertyToFunction,
} from "../../snippet";
import { ComponentInfo, DataType, Property } from "../../types";

suite("snippet", () => {
  suite("formatToFunctionName", () => {
    // Truth table: [input, expected, description]
    const cases: [string | undefined, string, string][] = [
      ["click", "onClick", "simple event name"],
      ["submit", "onSubmit", "form event"],
      ["closeModal", "onCloseModal", "camelCase event"],
      ["", "", "empty string"],
      [undefined, "", "undefined"],
    ];

    cases.forEach(([input, expected, description]) => {
      test(`should convert ${description}: "${input}" -> "${expected}"`, () => {
        assert.strictEqual(formatToFunctionName(input), expected);
      });
    });
  });

  suite("formatComponentName", () => {
    // Truth table: [input, expected, description]
    const cases: [string | undefined, string, string][] = [
      [
        "SaveCancelButtonComponent",
        "Save Cancel Button Component",
        "standard component",
      ],
      ["MyButtonComponent", "My Button Component", "simple component"],
      ["ABC", "", "all caps (no lowercase to split)"],
      ["", "", "empty string"],
      [undefined, "", "undefined"],
    ];

    cases.forEach(([input, expected, description]) => {
      test(`should format ${description}: "${input}" -> "${expected}"`, () => {
        assert.strictEqual(formatComponentName(input), expected);
      });
    });
  });

  suite("getTypeValues", () => {
    // Truth table: [type, expected, description]
    const cases: [string | DataType | undefined, string, string][] = [
      [DataType.BOOLEAN, "|true,false|", "boolean type"],
      [DataType.STRING, "", "string type"],
      [DataType.NUMBER, "", "number type"],
      [DataType.OBJECT, "", "object type"],
      [DataType.ANY, "", "any type"],
      ["CustomType", "", "custom type"],
      [undefined, "", "undefined type"],
    ];

    cases.forEach(([type, expected, description]) => {
      test(`should return "${expected}" for ${description}`, () => {
        assert.strictEqual(getTypeValues(type), expected);
      });
    });
  });

  suite("propertyToAttribute", () => {
    // Truth table: [property, index, expected]
    const cases: [Property, number, string, string][] = [
      [
        { name: "label", type: DataType.STRING },
        1,
        '  [label]="$1"',
        "string property",
      ],
      [
        { name: "disabled", type: DataType.BOOLEAN },
        2,
        '  [disabled]="${2|true,false|}"',
        "boolean property",
      ],
      [
        { name: "count", type: DataType.NUMBER },
        3,
        '  [count]="$3"',
        "number property",
      ],
      [{ name: "data", type: undefined }, 4, '  [data]="$4"', "undefined type"],
    ];

    cases.forEach(([property, index, expected, description]) => {
      test(`should format ${description}`, () => {
        assert.strictEqual(propertyToAttribute(property, index), expected);
      });
    });
  });

  suite("propertyToFunction", () => {
    // Truth table: [property, index, expected]
    const cases: [Property, number, string, string][] = [
      [
        { name: "change", type: undefined },
        0,
        '  (change)="$0:onChange($event)"',
        "change event",
      ],
      [
        { name: "click", type: undefined },
        1,
        '  (click)="$1:onClick($event)"',
        "click event",
      ],
      [
        { name: "save", type: DataType.BOOLEAN },
        5,
        '  (save)="$5:onSave($event)"',
        "save event",
      ],
    ];

    cases.forEach(([property, index, expected, description]) => {
      test(`should format ${description}`, () => {
        assert.strictEqual(propertyToFunction(property, index), expected);
      });
    });
  });

  suite("createSnippet", () => {
    const mockComponentInfo: Readonly<ComponentInfo> = {
      className: "SaveCancelButtonComponent",
      selector: "save-cancel-button",
      inputs: [
        { name: "label", type: DataType.STRING },
        { name: "disabled", type: DataType.BOOLEAN },
        { name: "icon", type: DataType.STRING },
        { name: "color", type: "Color" },
        { name: "tooltip", type: "string|undefined" },
      ],
      outputs: [
        { name: "cancel", type: DataType.BOOLEAN },
        { name: "save", type: DataType.ANY },
        { name: "draft", type: DataType.ANY },
      ],
    };

    test("should create snippet for component with inputs and outputs", () => {
      const result = createSnippet(mockComponentInfo);
      assert.deepStrictEqual(result, {
        "Save Cancel Button": {
          body: [
            "<save-cancel-button ",
            '  [label]="$1"',
            '  [disabled]="${2|true,false|}"',
            '  [icon]="$3"',
            '  [color]="$4"',
            '  [tooltip]="$5"',
            '  (cancel)="$6:onCancel($event)"',
            '  (save)="$7:onSave($event)"',
            '  (draft)="$8:onDraft($event)"',
            "></save-cancel-button>",
            "$9",
          ],
          description: "A code snippet for Save Cancel Button Component.",
          prefix: ["save-cancel-button"],
          scope: "html",
        },
      });
    });

    test("should create snippet for component with only inputs", () => {
      const component: ComponentInfo = {
        className: "ButtonComponent",
        selector: "my-button",
        inputs: [{ name: "label", type: DataType.STRING }],
        outputs: [],
      };
      const result = createSnippet(component);
      assert.ok(result);
      assert.strictEqual(result["My Button"].body.length, 4);
    });

    test("should create snippet for component with only outputs", () => {
      const component: ComponentInfo = {
        className: "ClickerComponent",
        selector: "clicker",
        inputs: [],
        outputs: [{ name: "clicked", type: undefined }],
      };
      const result = createSnippet(component);
      assert.ok(result);
      assert.strictEqual(result["Clicker"].body.length, 4);
    });

    test("should return undefined for component without selector", () => {
      const component: ComponentInfo = {
        className: "InvalidComponent",
        selector: "",
        inputs: [],
        outputs: [],
      };
      const result = createSnippet(component);
      assert.strictEqual(result, undefined);
    });
  });
});
