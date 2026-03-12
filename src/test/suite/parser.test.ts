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
import { IComponentInfo, IDirectiveInfo, IPipeInfo } from "../../types";

const EXPECTED_INPUT_COUNT = 5;
const EXPECTED_OUTPUT_COUNT = 3;
const DISABLED_ALIAS = "disabled";
const CANCEL_ALIAS = "cancel";

const MOCK_COMPONENT_DATA = `
  enum Color { RED = "red", WHITE = "white", BLUE = "blue" }
  @Component({ templateUrl: "x.html", selector: "save-cancel-button" })
  export class SaveCancelButtonComponent {
    @Input() public label: string;
    @Input("${DISABLED_ALIAS}") public get notEnabled(): boolean { return this._enabled; }
    private _enabled = false;
    @Input("icon") public iconName = "info";
    @Input() public color: Color;
    @Input() tooltip?: string;
    @Output("${CANCEL_ALIAS}") public deleteItAll: EventEmitter<boolean>;
    @Output() save = new EventEmitter<undefined>();
    @Output() public draft = new EventEmitter<any>();
  }
`;

const EXPECTED_COMPONENT_INFO: IComponentInfo = {
  kind: ArtifactKind.COMPONENT,
  className: "SaveCancelButtonComponent",
  selector: "save-cancel-button",
  inputs: [
    { name: "label", type: "string" },
    { name: DISABLED_ALIAS, type: "boolean" },
    { name: "icon", type: "any" },
    { name: "color", type: "Color" },
    { name: "tooltip", type: "string" },
  ],
  outputs: [
    { name: CANCEL_ALIAS, type: "boolean" },
    { name: "save", type: "any" },
    { name: "draft", type: "any" },
  ],
};

const MOCK_DIRECTIVE_DATA = `
  @Directive({ selector: '[appHighlight]' })
  export class HighlightDirective {
    @Input() highlightColor: string;
    @Input('appHighlight') defaultColor: string;
    @Output() highlighted = new EventEmitter<boolean>();
  }
`;

const EXPECTED_DIRECTIVE_INFO: IDirectiveInfo = {
  kind: ArtifactKind.DIRECTIVE,
  className: "HighlightDirective",
  selector: "[appHighlight]",
  inputs: [
    { name: "highlightColor", type: "string" },
    { name: "appHighlight", type: "string" },
  ],
  outputs: [{ name: "highlighted", type: "any" }],
};

const MOCK_PIPE_DATA = `
  @Pipe({ name: 'currencyFormat' })
  export class CurrencyFormatPipe implements PipeTransform {
    transform(value: number, currency: string): string { return currency + value.toFixed(2); }
  }
`;

const EXPECTED_PIPE_INFO: IPipeInfo = {
  kind: ArtifactKind.PIPE,
  className: "CurrencyFormatPipe",
  name: "currencyFormat",
};

/**
 * Defines core parse component tests (basic and property extraction).
 */
const registerParseComponentCoreTests = (): void => {
  test("should parse component and return metadata matching expected structure", () => {
    assert.deepStrictEqual(
      parseComponent(MOCK_COMPONENT_DATA),
      EXPECTED_COMPONENT_INFO
    );
  });
  test("should return undefined for empty string", () => {
    assert.strictEqual(parseComponent(""), undefined);
  });
  test("should return undefined for non-component code", () => {
    assert.strictEqual(parseComponent("const x = 1;"), undefined);
  });
  test("should extract className correctly", () => {
    assert.strictEqual(
      parseComponent(MOCK_COMPONENT_DATA)?.className,
      "SaveCancelButtonComponent"
    );
  });
  test("should extract selector correctly", () => {
    assert.strictEqual(
      parseComponent(MOCK_COMPONENT_DATA)?.selector,
      "save-cancel-button"
    );
  });
};

/**
 * Defines property extraction tests for parseComponent.
 */
const registerParseComponentPropertyTests = (): void => {
  test("should extract all input properties", () => {
    assert.strictEqual(
      parseComponent(MOCK_COMPONENT_DATA)?.inputs.length,
      EXPECTED_INPUT_COUNT
    );
  });
  test("should extract all output properties", () => {
    assert.strictEqual(
      parseComponent(MOCK_COMPONENT_DATA)?.outputs.length,
      EXPECTED_OUTPUT_COUNT
    );
  });
  test("should handle aliased input properties", () => {
    const input = parseComponent(MOCK_COMPONENT_DATA)?.inputs.find(
      (i) => i.name === DISABLED_ALIAS
    );
    assert.ok(input);
  });
  test("should handle aliased output properties", () => {
    const output = parseComponent(MOCK_COMPONENT_DATA)?.outputs.find(
      (o) => o.name === CANCEL_ALIAS
    );
    assert.ok(output);
  });
  test("should parse component with get accessor inputs", () => {
    const input = parseComponent(MOCK_COMPONENT_DATA)?.inputs.find(
      (i) => i.name === DISABLED_ALIAS
    );
    assert.ok(input);
    assert.strictEqual(input.type, "boolean");
  });
};

/**
 * Defines edge case tests for parseComponent.
 */
const registerParseComponentEdgeCaseTests = (): void => {
  test("should parse component with no inputs or outputs", () => {
    const result = parseComponent(
      `@Component({ selector: "simple" }) export class SimpleComponent {}`
    );
    assert.ok(result);
    assert.strictEqual(result.selector, "simple");
    assert.deepStrictEqual(result.inputs, []);
    assert.deepStrictEqual(result.outputs, []);
  });
  test("should return empty selector for class without Component decorator", () => {
    const result = parseComponent(`@Injectable() export class MyService {}`);
    assert.ok(result === undefined || result.selector === "");
  });
  test("should handle decorator with non-object argument", () => {
    const result = parseComponent(
      `@Component("invalid") export class InvalidComponent {}`
    );
    assert.ok(result);
    assert.strictEqual(result.selector, "");
  });
  test("should handle selector as non-string value", () => {
    const result = parseComponent(
      `@Component({ selector: someVariable }) export class VarSelectorComponent {}`
    );
    assert.ok(result);
    assert.strictEqual(result.selector, "");
  });
  test("should handle object without selector property", () => {
    const result = parseComponent(
      `@Component({ template: '<div></div>' }) export class NoSelectorComponent {}`
    );
    assert.ok(result);
    assert.strictEqual(result.selector, "");
  });
};

/**
 * Defines additional edge case tests for parseComponent.
 */
const registerParseComponentExtraTests = (): void => {
  test("should handle property with computed name", () => {
    const result = parseComponent(
      `@Component({ selector: "computed" }) export class ComputedComponent { @Input() ['dynamic']: string; }`
    );
    assert.ok(result);
    assert.strictEqual(result.inputs.length, 1);
    assert.strictEqual(result.inputs[0].name, "");
  });
  test("should handle selector with spread operator in decorator object", () => {
    const result = parseComponent(
      `const base = {}; @Component({ ...base, selector: 'spread-component' }) export class SpreadComponent {}`
    );
    assert.ok(result);
    assert.strictEqual(result.selector, "spread-component");
  });
  test("should handle template literal selector", () => {
    const result = parseComponent(
      `@Component({ selector: \`template-literal\` }) export class TemplateLiteralComponent {}`
    );
    assert.ok(result);
    assert.strictEqual(result.selector, "template-literal");
  });
};

/**
 * Registers all tests for parseComponent.
 */
const registerParseComponentTests = (): void => {
  suite("parseComponent", () => {
    registerParseComponentCoreTests();
    registerParseComponentPropertyTests();
    registerParseComponentEdgeCaseTests();
    registerParseComponentExtraTests();
  });
};

/**
 * Defines core tests for parseDirective.
 */
const registerParseDirectiveCoreTests = (): void => {
  test("should parse directive and return metadata matching expected structure", () => {
    assert.deepStrictEqual(
      parseDirective(MOCK_DIRECTIVE_DATA),
      EXPECTED_DIRECTIVE_INFO
    );
  });
  test("should return undefined for empty string", () => {
    assert.strictEqual(parseDirective(""), undefined);
  });
  test("should return undefined for non-directive code", () => {
    assert.strictEqual(parseDirective("const x = 1;"), undefined);
  });
  test("should return undefined for component code", () => {
    const result = parseDirective(
      `@Component({ selector: 'my-component' }) export class MyComponent {}`
    );
    assert.strictEqual(result, undefined);
  });
  test("should parse directive with no inputs or outputs", () => {
    const result = parseDirective(
      `@Directive({ selector: '[simple]' }) export class SimpleDirective {}`
    );
    assert.ok(result);
    assert.strictEqual(result.kind, "directive");
    assert.strictEqual(result.selector, "[simple]");
    assert.deepStrictEqual(result.inputs, []);
    assert.deepStrictEqual(result.outputs, []);
  });
};

/**
 * Registers all tests for parseDirective.
 */
const registerParseDirectiveTests = (): void => {
  suite("parseDirective", registerParseDirectiveCoreTests);
};

/**
 * Defines tests for parseAngularFile.
 */
const registerParseAngularFileCoreTests = (): void => {
  test("should detect and parse component", () => {
    const result = parseAngularFile(
      `@Component({ selector: 'my-comp' }) export class MyComponent {}`
    );
    assert.ok(result);
    assert.strictEqual(result.kind, ArtifactKind.COMPONENT);
  });
  test("should detect and parse directive", () => {
    const result = parseAngularFile(
      `@Directive({ selector: '[myDir]' }) export class MyDirective {}`
    );
    assert.ok(result);
    assert.strictEqual(result.kind, ArtifactKind.DIRECTIVE);
  });
  test("should detect and parse pipe", () => {
    const result = parseAngularFile(
      `@Pipe({ name: 'myPipe' }) export class MyPipe {}`
    );
    assert.ok(result);
    assert.strictEqual(result.kind, ArtifactKind.PIPE);
  });
  test("should return undefined for non-Angular class", () => {
    assert.strictEqual(
      parseAngularFile(`@Injectable() export class MyService {}`),
      undefined
    );
  });
  test("should return undefined for empty string", () => {
    assert.strictEqual(parseAngularFile(""), undefined);
  });
};

/**
 * Registers all tests for parseAngularFile.
 */
const registerParseAngularFileTests = (): void => {
  suite("parseAngularFile", registerParseAngularFileCoreTests);
};

/**
 * Defines core tests for parsePipe.
 */
const registerParsePipeCoreTests = (): void => {
  test("should parse pipe and return metadata matching expected structure", () => {
    assert.deepStrictEqual(parsePipe(MOCK_PIPE_DATA), EXPECTED_PIPE_INFO);
  });
  test("should return undefined for empty string", () => {
    assert.strictEqual(parsePipe(""), undefined);
  });
  test("should return undefined for non-pipe code", () => {
    assert.strictEqual(parsePipe("const x = 1;"), undefined);
  });
  test("should return undefined for component code", () => {
    const result = parsePipe(
      `@Component({ selector: 'my-component' }) export class MyComponent {}`
    );
    assert.strictEqual(result, undefined);
  });
  test("should extract pipe name correctly", () => {
    assert.strictEqual(parsePipe(MOCK_PIPE_DATA)?.name, "currencyFormat");
  });
};

/**
 * Registers all tests for parsePipe.
 */
const registerParsePipeTests = (): void => {
  suite("parsePipe", registerParsePipeCoreTests);
};

suite("parser", () => {
  registerParseAngularFileTests();
  registerParseComponentTests();
  registerParseDirectiveTests();
  registerParsePipeTests();
});
