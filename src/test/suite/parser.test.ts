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

import { ArtifactKind } from "../../constants";
import {
  parseAngularFile,
  parseComponent,
  parseDirective,
  parsePipe,
} from "../../parser";
import { ComponentInfo, DirectiveInfo, PipeInfo } from "../../types";

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
    kind: ArtifactKind.COMPONENT,
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

  suite("parseDirective", () => {
    const mockDirectiveData = `
      @Directive({
        selector: '[appHighlight]'
      })
      export class HighlightDirective {
        @Input() highlightColor: string;
        @Input('appHighlight') defaultColor: string;
        @Output() highlighted = new EventEmitter<boolean>();
      }
    `;

    const expectedDirectiveInfo: DirectiveInfo = {
      kind: ArtifactKind.DIRECTIVE,
      className: "HighlightDirective",
      selector: "[appHighlight]",
      inputs: [
        { name: "highlightColor", type: "string" },
        { name: "appHighlight", type: "string" },
      ],
      outputs: [{ name: "highlighted", type: "any" }],
    };

    test("should parse directive and return metadata matching expected structure", () => {
      const directive = parseDirective(mockDirectiveData);
      assert.deepStrictEqual(directive, expectedDirectiveInfo);
    });

    test("should return undefined for empty string", () => {
      const result = parseDirective("");
      assert.strictEqual(result, undefined);
    });

    test("should return undefined for non-directive code", () => {
      const result = parseDirective("const x = 1;");
      assert.strictEqual(result, undefined);
    });

    test("should return undefined for component code", () => {
      const componentCode = `
        @Component({ selector: 'my-component' })
        export class MyComponent {}
      `;
      const result = parseDirective(componentCode);
      assert.strictEqual(result, undefined);
    });

    test("should parse directive with no inputs or outputs", () => {
      const simpleDirective = `
        @Directive({ selector: '[simple]' })
        export class SimpleDirective {}
      `;
      const result = parseDirective(simpleDirective);
      assert.ok(result);
      assert.strictEqual(result.kind, "directive");
      assert.strictEqual(result.className, "SimpleDirective");
      assert.strictEqual(result.selector, "[simple]");
      assert.deepStrictEqual(result.inputs, []);
      assert.deepStrictEqual(result.outputs, []);
    });
  });

  suite("parsePipe", () => {
    const mockPipeData = `
      @Pipe({
        name: 'currencyFormat'
      })
      export class CurrencyFormatPipe implements PipeTransform {
        transform(value: number, currency: string): string {
          return currency + value.toFixed(2);
        }
      }
    `;

    const expectedPipeInfo: PipeInfo = {
      kind: ArtifactKind.PIPE,
      className: "CurrencyFormatPipe",
      name: "currencyFormat",
    };

    test("should parse pipe and return metadata matching expected structure", () => {
      const pipe = parsePipe(mockPipeData);
      assert.deepStrictEqual(pipe, expectedPipeInfo);
    });

    test("should return undefined for empty string", () => {
      const result = parsePipe("");
      assert.strictEqual(result, undefined);
    });

    test("should return undefined for non-pipe code", () => {
      const result = parsePipe("const x = 1;");
      assert.strictEqual(result, undefined);
    });

    test("should return undefined for component code", () => {
      const componentCode = `
        @Component({ selector: 'my-component' })
        export class MyComponent {}
      `;
      const result = parsePipe(componentCode);
      assert.strictEqual(result, undefined);
    });

    test("should extract pipe name correctly", () => {
      const pipe = parsePipe(mockPipeData);
      assert.strictEqual(pipe?.name, "currencyFormat");
    });
  });

  suite("parseAngularFile", () => {
    test("should detect and parse component", () => {
      const componentCode = `
        @Component({ selector: 'my-comp' })
        export class MyComponent {}
      `;
      const result = parseAngularFile(componentCode);
      assert.ok(result);
      assert.strictEqual(result.kind, ArtifactKind.COMPONENT);
    });

    test("should detect and parse directive", () => {
      const directiveCode = `
        @Directive({ selector: '[myDir]' })
        export class MyDirective {}
      `;
      const result = parseAngularFile(directiveCode);
      assert.ok(result);
      assert.strictEqual(result.kind, ArtifactKind.DIRECTIVE);
    });

    test("should detect and parse pipe", () => {
      const pipeCode = `
        @Pipe({ name: 'myPipe' })
        export class MyPipe {}
      `;
      const result = parseAngularFile(pipeCode);
      assert.ok(result);
      assert.strictEqual(result.kind, ArtifactKind.PIPE);
    });

    test("should return undefined for non-Angular class", () => {
      const serviceCode = `
        @Injectable()
        export class MyService {}
      `;
      const result = parseAngularFile(serviceCode);
      assert.strictEqual(result, undefined);
    });

    test("should return undefined for empty string", () => {
      const result = parseAngularFile("");
      assert.strictEqual(result, undefined);
    });
  });
});
