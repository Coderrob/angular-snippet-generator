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

import { parseComponent } from "../../parser";
import { ComponentInfo } from "../../types";

suite("parser", () => {
  const mockComponentData = `
		enum Color {
			RED = "red",
			WHITE = "white",
			BLUE = "blue",
		}

		@Component({
			templateUrl: "save-cancel-button.component.html",
			selector: "save-cancel-button",
		})
		export class SaveCancelButtonComponent {
			@Input()
			public label: string;

			@Input("disabled")
			public get notEnabled(): boolean {
				return this._enabled;
			}
			private _enabled = false;

			@Input("icon")
			public iconName = "info";
			@Input() public color: Color;
			@Input() tooltip?: string;

			@Output("cancel")
			public deleteItAll: EventEmitter<boolean>;

			@Output() save = new EventEmitter<undefined>();
			@Output()
			public draft = new EventEmitter<any>();
		}
	`;

  const expectedComponentInfo: ComponentInfo = {
    className: "SaveCancelButtonComponent",
    selector: "save-cancel-button",
    inputs: [
      { name: "label", type: "string" },
      { name: "disabled", type: "boolean" },
      { name: "icon", type: "any" }, // Initializer only, no explicit type
      { name: "color", type: "Color" },
      { name: "tooltip", type: "string" }, // Optional marker not in type text
    ],
    outputs: [
      { name: "cancel", type: "boolean" },
      { name: "save", type: "any" },
      { name: "draft", type: "any" },
    ],
  };

  suite("parseComponent", () => {
    test("should parse component and return metadata matching expected structure", () => {
      const component = parseComponent(mockComponentData);
      assert.deepStrictEqual(component, expectedComponentInfo);
    });

    test("should return undefined for empty string", () => {
      const result = parseComponent("");
      assert.strictEqual(result, undefined);
    });

    test("should return undefined for non-component code", () => {
      const result = parseComponent("const x = 1;");
      assert.strictEqual(result, undefined);
    });

    test("should parse component with no inputs or outputs", () => {
      const simpleComponent = `
				@Component({ selector: "simple" })
				export class SimpleComponent {}
			`;
      const result = parseComponent(simpleComponent);
      assert.ok(result);
      assert.strictEqual(result.className, "SimpleComponent");
      assert.strictEqual(result.selector, "simple");
      assert.deepStrictEqual(result.inputs, []);
      assert.deepStrictEqual(result.outputs, []);
    });

    test("should extract className correctly", () => {
      const component = parseComponent(mockComponentData);
      assert.strictEqual(component?.className, "SaveCancelButtonComponent");
    });

    test("should extract selector correctly", () => {
      const component = parseComponent(mockComponentData);
      assert.strictEqual(component?.selector, "save-cancel-button");
    });

    test("should extract all input properties", () => {
      const component = parseComponent(mockComponentData);
      assert.strictEqual(component?.inputs.length, 5);
    });

    test("should extract all output properties", () => {
      const component = parseComponent(mockComponentData);
      assert.strictEqual(component?.outputs.length, 3);
    });

    test("should handle aliased input properties", () => {
      const component = parseComponent(mockComponentData);
      const disabledInput = component?.inputs.find(
        (i) => i.name === "disabled"
      );
      assert.ok(disabledInput);
    });

    test("should handle aliased output properties", () => {
      const component = parseComponent(mockComponentData);
      const cancelOutput = component?.outputs.find((o) => o.name === "cancel");
      assert.ok(cancelOutput);
    });

    test("should parse component with get accessor inputs", () => {
      const result = parseComponent(mockComponentData);
      const disabledInput = result?.inputs.find((i) => i.name === "disabled");
      assert.ok(disabledInput);
      assert.strictEqual(disabledInput.type, "boolean");
    });

    test("should return empty selector for class without selector in decorator", () => {
      const noSelectorComponent = `
        @Injectable()
        export class MyService {}
      `;
      // parseComponent looks for any class, so returns result even without @Component
      // but with empty selector since no Component decorator found
      const result = parseComponent(noSelectorComponent);
      // If there's no @Component decorator at all, it may still parse the class
      // but selector will be empty
      assert.ok(result === undefined || result.selector === "");
    });

    test("should handle decorator with non-object argument", () => {
      const invalidComponent = `
        @Component("invalid")
        export class InvalidComponent {}
      `;
      const result = parseComponent(invalidComponent);
      assert.ok(result);
      assert.strictEqual(result.selector, "");
    });

    test("should handle selector as non-string value", () => {
      const invalidSelector = `
        @Component({ selector: someVariable })
        export class VarSelectorComponent {}
      `;
      const result = parseComponent(invalidSelector);
      assert.ok(result);
      assert.strictEqual(result.selector, "");
    });

    test("should handle object without selector property", () => {
      const noSelector = `
        @Component({ template: '<div></div>' })
        export class NoSelectorComponent {}
      `;
      const result = parseComponent(noSelector);
      assert.ok(result);
      assert.strictEqual(result.selector, "");
    });

    test("should handle property with computed name", () => {
      const computedName = `
        @Component({ selector: "computed" })
        export class ComputedComponent {
          @Input() ['dynamic']: string;
        }
      `;
      const result = parseComponent(computedName);
      assert.ok(result);
      assert.strictEqual(result.selector, "computed");
      // Computed property names result in empty name
      assert.strictEqual(result.inputs.length, 1);
      assert.strictEqual(result.inputs[0].name, "");
    });

    test("should handle selector with spread operator in decorator object", () => {
      const spreadSelector = `
        const base = { template: '' };
        @Component({ ...base, selector: 'spread-component' })
        export class SpreadComponent {}
      `;
      const result = parseComponent(spreadSelector);
      assert.ok(result);
      assert.strictEqual(result.selector, "spread-component");
    });

    test("should handle multiple arguments in component decorator", () => {
      const multiArg = `
        @Component({ selector: 'multi' }, { extra: true })
        export class MultiArgComponent {}
      `;
      const result = parseComponent(multiArg);
      assert.ok(result);
      assert.strictEqual(result.selector, "multi");
    });

    test("should handle property assignment that is not string literal", () => {
      const templateLiteral = `
        @Component({ selector: \`template-literal\` })
        export class TemplateLiteralComponent {}
      `;
      const result = parseComponent(templateLiteral);
      assert.ok(result);
      // Template literals are StringLiteralLike
      assert.strictEqual(result.selector, "template-literal");
    });
  });
});
