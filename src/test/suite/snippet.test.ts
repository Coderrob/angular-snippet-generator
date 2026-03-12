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
  createDirectiveSnippet,
  createPipeSnippet,
  createSnippet,
  formatComponentName,
  formatToFunctionName,
  getTypeValues,
  propertyToAttribute,
  propertyToFunction,
} from "../../snippet";
import {
  DataType,
  IComponentInfo,
  IDirectiveInfo,
  IPipeInfo,
  IProperty,
} from "../../types";

const BODY_ONE_PROP = 4;
const TAB_STOP_2 = 2;
const TAB_STOP_3 = 3;
const TAB_STOP_4 = 4;
const TAB_STOP_5 = 5;

const SAVE_CANCEL_BUTTON_KEY = "Save Cancel Button";
const HIGHLIGHT_DIRECTIVE_KEY = "Highlight Directive Directive";
const CURRENCY_FORMAT_PIPE_KEY = "Currency Format Pipe Pipe";

const FORMAT_FN_CASES: [string | undefined, string, string][] = [
  ["click", "onClick", "simple event name"],
  ["submit", "onSubmit", "form event"],
  ["closeModal", "onCloseModal", "camelCase event"],
  ["", "", "empty string"],
  [undefined, "", "undefined"],
];

const FORMAT_COMP_CASES: [string | undefined, string, string][] = [
  [
    "SaveCancelButtonComponent",
    "Save Cancel Button Component",
    "standard component",
  ],
  ["MyButtonComponent", "My Button Component", "simple component"],
  ["ABC", "", "all caps"],
  ["", "", "empty string"],
  [undefined, "", "undefined"],
];

const GET_TYPE_VALUES_CASES: [string | DataType | undefined, string, string][] =
  [
    [DataType.BOOLEAN, "|true,false|", "boolean type"],
    [DataType.STRING, "", "string type"],
    [DataType.NUMBER, "", "number type"],
    [DataType.OBJECT, "", "object type"],
    [DataType.ANY, "", "any type"],
    ["CustomType", "", "custom type"],
    [undefined, "", "undefined type"],
  ];

const PROPERTY_TO_ATTR_CASES: [IProperty, number, string, string][] = [
  [
    { name: "label", type: DataType.STRING },
    1,
    '  [label]="$1"',
    "string property",
  ],
  [
    { name: "disabled", type: DataType.BOOLEAN },
    TAB_STOP_2,
    '  [disabled]="${2|true,false|}"',
    "boolean property",
  ],
  [
    { name: "count", type: DataType.NUMBER },
    TAB_STOP_3,
    '  [count]="$3"',
    "number property",
  ],
  [
    { name: "data", type: undefined },
    TAB_STOP_4,
    '  [data]="$4"',
    "undefined type",
  ],
];

const PROPERTY_TO_FN_CASES: [IProperty, number, string, string][] = [
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
    TAB_STOP_5,
    '  (save)="$5:onSave($event)"',
    "save event",
  ],
];

const MOCK_COMPONENT: Readonly<IComponentInfo> = {
  kind: ArtifactKind.COMPONENT,
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

const MOCK_DIRECTIVE: Readonly<IDirectiveInfo> = {
  kind: ArtifactKind.DIRECTIVE,
  className: "HighlightDirective",
  selector: "[appHighlight]",
  inputs: [
    { name: "appHighlight", type: DataType.STRING },
    { name: "highlightColor", type: DataType.STRING },
  ],
  outputs: [{ name: "highlighted", type: DataType.BOOLEAN }],
};

const MOCK_PIPE: Readonly<IPipeInfo> = {
  kind: ArtifactKind.PIPE,
  className: "CurrencyFormatPipe",
  name: "currencyFormat",
};

const EXPECTED_COMPONENT_SNIPPET = {
  [SAVE_CANCEL_BUTTON_KEY]: {
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
};

const EXPECTED_DIRECTIVE_SNIPPET = {
  [HIGHLIGHT_DIRECTIVE_KEY]: {
    body: [
      "appHighlight",
      '  [appHighlight]="$1"',
      '  [highlightColor]="$2"',
      '  (highlighted)="$3:onHighlighted($event)"',
      "$4",
    ],
    description: "A directive snippet for Highlight Directive.",
    prefix: ["appHighlight"],
    scope: "html",
  },
};

const EXPECTED_PIPE_SNIPPET = {
  [CURRENCY_FORMAT_PIPE_KEY]: {
    body: ["{{ $1 | currencyFormat$2 }}"],
    description: "A pipe snippet for Currency Format Pipe.",
    prefix: ["currencyFormat", "| currencyFormat"],
    scope: "html",
  },
};

/**
 * Defines tests for createDirectiveSnippet.
 */
const registerCreateDirectiveSnippetCore = (): void => {
  test("should create snippet for directive with inputs and outputs", () => {
    assert.deepStrictEqual(
      createDirectiveSnippet(MOCK_DIRECTIVE),
      EXPECTED_DIRECTIVE_SNIPPET
    );
  });
  test("should create snippet for directive with only inputs", () => {
    const directive: IDirectiveInfo = {
      kind: ArtifactKind.DIRECTIVE,
      className: "TooltipDirective",
      selector: "[tooltip]",
      inputs: [{ name: "tooltip", type: DataType.STRING }],
      outputs: [],
    };
    const result = createDirectiveSnippet(directive);
    assert.ok(result);
    assert.strictEqual(result["Tooltip Directive Directive"].body.length, 3);
  });
  test("should return undefined for directive without selector", () => {
    const directive: IDirectiveInfo = {
      kind: ArtifactKind.DIRECTIVE,
      className: "TestDirective",
      selector: "",
      inputs: [],
      outputs: [],
    };
    assert.strictEqual(createDirectiveSnippet(directive), undefined);
  });
};

/**
 * Registers tests for createDirectiveSnippet.
 */
const registerCreateDirectiveSnippetTests = (): void => {
  suite("createDirectiveSnippet", registerCreateDirectiveSnippetCore);
};

/**
 * Defines tests for createPipeSnippet.
 */
const registerCreatePipeSnippetCore = (): void => {
  test("should create snippet for pipe", () => {
    assert.deepStrictEqual(createPipeSnippet(MOCK_PIPE), EXPECTED_PIPE_SNIPPET);
  });
  test("should return undefined for pipe without name", () => {
    const pipe: IPipeInfo = {
      kind: ArtifactKind.PIPE,
      className: "InvalidPipe",
      name: "",
    };
    assert.strictEqual(createPipeSnippet(pipe), undefined);
  });
};

/**
 * Registers tests for createPipeSnippet.
 */
const registerCreatePipeSnippetTests = (): void => {
  suite("createPipeSnippet", registerCreatePipeSnippetCore);
};

/**
 * Defines delegation tests for createSnippet.
 */
const registerCreateSnippetDelegationCore = (): void => {
  test("should delegate to component snippet for component info", () => {
    const component: IComponentInfo = {
      kind: ArtifactKind.COMPONENT,
      className: "TestComponent",
      selector: "test-comp",
      inputs: [],
      outputs: [],
    };
    const result = createSnippet(component);
    assert.ok(result);
    assert.ok(result["Test Comp"].body[0].includes("<test-comp"));
  });
  test("should delegate to directive snippet for directive info", () => {
    const directive: IDirectiveInfo = {
      kind: ArtifactKind.DIRECTIVE,
      className: "TestDirective",
      selector: "[testDir]",
      inputs: [],
      outputs: [],
    };
    const result = createSnippet(directive);
    assert.ok(result);
    assert.ok(result["Test Directive Directive"].body[0].includes("testDir"));
  });
  test("should delegate to pipe snippet for pipe info", () => {
    const pipe: IPipeInfo = {
      kind: ArtifactKind.PIPE,
      className: "TestPipe",
      name: "testPipe",
    };
    const result = createSnippet(pipe);
    assert.ok(result);
    assert.ok(result["Test Pipe Pipe"].body[0].includes("testPipe"));
  });
};

/**
 * Registers delegation tests for createSnippet.
 */
const registerCreateSnippetDelegationTests = (): void => {
  suite(
    "createSnippet with different Angular types",
    registerCreateSnippetDelegationCore
  );
};

/**
 * Defines core tests for createSnippet.
 */
const registerCreateSnippetCore = (): void => {
  test("should create snippet for component with inputs and outputs", () => {
    assert.deepStrictEqual(
      createSnippet(MOCK_COMPONENT),
      EXPECTED_COMPONENT_SNIPPET
    );
  });
  test("should create snippet for component with only inputs", () => {
    const component: IComponentInfo = {
      kind: ArtifactKind.COMPONENT,
      className: "ButtonComponent",
      selector: "my-button",
      inputs: [{ name: "label", type: DataType.STRING }],
      outputs: [],
    };
    const result = createSnippet(component);
    assert.ok(result);
    assert.strictEqual(result["My Button"].body.length, BODY_ONE_PROP);
  });
  test("should create snippet for component with only outputs", () => {
    const component: IComponentInfo = {
      kind: ArtifactKind.COMPONENT,
      className: "ClickerComponent",
      selector: "clicker",
      inputs: [],
      outputs: [{ name: "clicked", type: undefined }],
    };
    const result = createSnippet(component);
    assert.ok(result);
    assert.strictEqual(result["Clicker"].body.length, BODY_ONE_PROP);
  });
  test("should return undefined for component without selector", () => {
    const component: IComponentInfo = {
      kind: ArtifactKind.COMPONENT,
      className: "TestComponent",
      selector: "",
      inputs: [],
      outputs: [],
    };
    assert.strictEqual(createSnippet(component), undefined);
  });
};

/**
 * Registers tests for createSnippet.
 */
const registerCreateSnippetTests = (): void => {
  suite("createSnippet", registerCreateSnippetCore);
};

/**
 * Registers tests for formatComponentName.
 */
const registerFormatComponentNameTests = (): void => {
  suite("formatComponentName", () => {
    FORMAT_COMP_CASES.forEach(([input, expected, description]) => {
      test(`should format ${description}`, () => {
        assert.strictEqual(formatComponentName(input), expected);
      });
    });
  });
};

/**
 * Registers tests for formatToFunctionName.
 */
const registerFormatToFunctionNameTests = (): void => {
  suite("formatToFunctionName", () => {
    FORMAT_FN_CASES.forEach(([input, expected, description]) => {
      test(`should convert ${description}`, () => {
        assert.strictEqual(formatToFunctionName(input), expected);
      });
    });
  });
};

/**
 * Registers tests for getTypeValues.
 */
const registerGetTypeValuesTests = (): void => {
  suite("getTypeValues", () => {
    GET_TYPE_VALUES_CASES.forEach(([type, expected, description]) => {
      test(`should return "${expected}" for ${description}`, () => {
        assert.strictEqual(getTypeValues(type), expected);
      });
    });
  });
};

/**
 * Registers tests for propertyToAttribute.
 */
const registerPropertyToAttributeTests = (): void => {
  suite("propertyToAttribute", () => {
    PROPERTY_TO_ATTR_CASES.forEach(
      ([property, index, expected, description]) => {
        test(`should format ${description}`, () => {
          assert.strictEqual(propertyToAttribute(property, index), expected);
        });
      }
    );
  });
};

/**
 * Registers tests for propertyToFunction.
 */
const registerPropertyToFunctionTests = (): void => {
  suite("propertyToFunction", () => {
    PROPERTY_TO_FN_CASES.forEach(([property, index, expected, description]) => {
      test(`should format ${description}`, () => {
        assert.strictEqual(propertyToFunction(property, index), expected);
      });
    });
  });
};

suite("snippet", () => {
  registerCreateDirectiveSnippetTests();
  registerCreatePipeSnippetTests();
  registerCreateSnippetDelegationTests();
  registerCreateSnippetTests();
  registerFormatComponentNameTests();
  registerFormatToFunctionNameTests();
  registerGetTypeValuesTests();
  registerPropertyToAttributeTests();
  registerPropertyToFunctionTests();
});
