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

import ts from "typescript";

import {
  findAssignedProperty,
  getAliasName,
  getClassName,
  getReferenceTypeName,
  getTypeName,
  isComponent,
  isDecorator,
  isDirective,
  isIdentifier,
  isPipe,
  isPropertyOrGetAccessor,
} from "../../nodes";
import { DecoratorType } from "../../types";

/**
 * Helper to create a source file from code string.
 * @param code Code string to parse.
 * @returns Parsed source file.
 */
const createSource = (code: string): ts.SourceFile =>
  ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);

/**
 * Helper to find first matching node in AST.
 * @param source Source file.
 * @param predicate Node predicate.
 * @returns First matching node or undefined.
 */
const findNode = <T extends ts.Node>(
  source: ts.SourceFile,
  predicate: (node: ts.Node) => node is T
): T | undefined => {
  let result: T | undefined;
  const visit = (node: ts.Node): void => {
    if (result) return;
    if (predicate(node)) {
      result = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
};

/**
 * Runs test cases for functions accepting a node and source file.
 * @param cases Test cases [code, expected, desc, predicate].
 * @param fn Function under test.
 */
const runNodeTests = <T>(
  cases: [string, T, string, (n: ts.Node) => n is ts.Node][],
  fn: (node: ts.Node, source: ts.SourceFile) => T
): void => {
  cases.forEach(([code, expected, desc, pred]) => {
    test(`should return "${expected}" for ${desc}`, () => {
      const source = createSource(code);
      const node = findNode(source, pred);
      assert.ok(node);
      assert.strictEqual(fn(node, source), expected);
    });
  });
};

// Typed wrapper functions to avoid type assertion casts
const isClassDeclarationNode = (n: ts.Node): n is ts.Node =>
  ts.isClassDeclaration(n);
const isClassExpressionNode = (n: ts.Node): n is ts.Node =>
  ts.isClassExpression(n);
const isGetAccessorNode = (n: ts.Node): n is ts.Node => ts.isGetAccessor(n);
const isMethodDeclarationNode = (n: ts.Node): n is ts.Node =>
  ts.isMethodDeclaration(n);
const isObjectLiteralExpressionNode = (n: ts.Node): n is ts.Node =>
  ts.isObjectLiteralExpression(n);
const isPropertyDeclarationNode = (n: ts.Node): n is ts.Node =>
  ts.isPropertyDeclaration(n);
const isVariableDeclarationNode = (n: ts.Node): n is ts.Node =>
  ts.isVariableDeclaration(n);

const IS_PROPERTY_OR_GET_CASES: [
  string,
  (n: ts.Node) => n is ts.Node,
  boolean,
  string,
][] = [
  [
    "class A { prop: string; }",
    isPropertyDeclarationNode,
    true,
    "property declaration",
  ],
  [
    "class A { get prop() { return 1; } }",
    isGetAccessorNode,
    true,
    "get accessor",
  ],
  [
    "class A { method() {} }",
    isMethodDeclarationNode,
    false,
    "method declaration",
  ],
];

const FIND_ASSIGNED_NEG_CASES: [
  string,
  string,
  string,
  (n: ts.Node) => n is ts.Node,
][] = [
  [
    "const x = { selector: 'test' };",
    "notFound",
    "non-existent property",
    isObjectLiteralExpressionNode,
  ],
  ["const x = 1;", "any", "non-object node", isVariableDeclarationNode],
  [
    "const name = 'x'; const obj = { name };",
    "name",
    "shorthand property",
    isObjectLiteralExpressionNode,
  ],
];

const GET_CLASS_NAME_CASES: [
  string,
  string,
  string,
  (n: ts.Node) => n is ts.Node,
][] = [
  ["class MyClass {}", "MyClass", "class declaration", isClassDeclarationNode],
  ["const x = 1;", "", "non-class node", isVariableDeclarationNode],
  ["const x = class {};", "", "anonymous class", isClassExpressionNode],
];

const GET_REFERENCE_TYPE_CASES: [string, string, string][] = [
  ["class A { prop: string; }", "string", "property with type annotation"],
  [
    "class A { prop: EventEmitter<boolean>; }",
    "boolean",
    "EventEmitter generic",
  ],
  ["class A { prop: EventEmitter; }", "any", "EventEmitter without type arg"],
  ["class A { prop: Namespace.Type; }", "any", "qualified type name"],
  [
    "class A { prop: Observable<string>; }",
    "string",
    "non-EventEmitter generic",
  ],
  ["class A { prop: Observable; }", "Observable", "generic without argument"],
  ["class A { prop: string[]; }", "string[]", "array type syntax"],
  ["class A { prop: string | number; }", "string | number", "union type"],
  ["class A { prop = 'value'; }", "any", "property without type"],
];

const GET_TYPE_NAME_CASES: [
  string,
  string,
  string,
  (n: ts.Node) => n is ts.Node,
][] = [
  [
    "class A { prop: number; }",
    "number",
    "property declaration",
    isPropertyDeclarationNode,
  ],
  [
    "class A { get prop(): boolean { return true; } }",
    "boolean",
    "get accessor",
    isGetAccessorNode,
  ],
  [
    "class A { method() {} }",
    "",
    "method declaration",
    isMethodDeclarationNode,
  ],
];

/**
 * Registers tests for findAssignedProperty.
 */
const registerFindAssignedPropertyTests = (): void => {
  suite("findAssignedProperty", () => {
    test("should find property by name in object literal", () => {
      const source = createSource("const x = { selector: 'test' };");
      const objNode = findNode(source, isObjectLiteralExpressionNode);
      assert.ok(objNode && findAssignedProperty(objNode, "selector"));
    });
    FIND_ASSIGNED_NEG_CASES.forEach(([code, propName, desc, pred]) => {
      test(`should return undefined for ${desc}`, () => {
        const source = createSource(code);
        const node = findNode(source, pred);
        assert.ok(node);
        assert.strictEqual(findAssignedProperty(node, propName), undefined);
      });
    });
  });
};

/**
 * Registers tests for getAliasName.
 */
const registerGetAliasNameTests = (): void => {
  suite("getAliasName", () => {
    const cases: [string, string, string][] = [
      [
        "@Input('myAlias') prop: string;",
        "myAlias",
        "call with string argument",
      ],
      ["@Input() prop: string;", "", "call without arguments"],
      ["func(123);", "", "call with non-string argument"],
    ];
    cases.forEach(([code, expected, desc]) => {
      test(`should return "${expected}" for ${desc}`, () => {
        const source = createSource(code);
        const callNode = findNode(source, ts.isCallExpression);
        assert.ok(callNode);
        assert.strictEqual(getAliasName(callNode), expected);
      });
    });
    test("should return empty string for non-call expression", () => {
      const source = createSource("const x = 1;");
      const varNode = findNode(source, isVariableDeclarationNode);
      assert.ok(varNode);
      assert.strictEqual(getAliasName(varNode), "");
    });
  });
};

/**
 * Registers tests for getClassName.
 */
const registerGetClassNameTests = (): void => {
  suite("getClassName", () => {
    runNodeTests(GET_CLASS_NAME_CASES, getClassName);
    test("should return empty string for undefined node", () => {
      assert.strictEqual(getClassName(undefined as unknown as ts.Node), "");
    });
  });
};

/**
 * Registers tests for getReferenceTypeName.
 */
const registerGetReferenceTypeNameTests = (): void => {
  suite("getReferenceTypeName", () => {
    GET_REFERENCE_TYPE_CASES.forEach(([code, expected, desc]) => {
      test(`should return "${expected}" for ${desc}`, () => {
        const source = createSource(code);
        const propNode = findNode(source, isPropertyDeclarationNode);
        assert.ok(propNode);
        assert.strictEqual(getReferenceTypeName(propNode, source), expected);
      });
    });
    test("should return default type for non-property node", () => {
      const source = createSource("const x = 1;");
      const varNode = findNode(source, isVariableDeclarationNode);
      assert.ok(varNode);
      assert.strictEqual(getReferenceTypeName(varNode, source), "any");
    });
  });
};

/**
 * Registers tests for getTypeName.
 */
const registerGetTypeNameTests = (): void => {
  suite("getTypeName", () => {
    runNodeTests(GET_TYPE_NAME_CASES, getTypeName);
  });
};

/**
 * Registers tests for isComponent.
 */
const registerIsComponentTests = (): void => {
  suite("isComponent", () => {
    const cases: [string, boolean, string][] = [
      ["@Component({}) class A {}", true, "Component decorator"],
      ["@Injectable() class A {}", false, "non-Component decorator"],
    ];
    cases.forEach(([code, expected, desc]) => {
      test(`should return ${expected} for ${desc}`, () => {
        const source = createSource(code);
        const decNode = findNode(source, ts.isDecorator);
        assert.ok(decNode);
        assert.strictEqual(isComponent(decNode), expected);
      });
    });
    test("should return false for undefined decorator", () => {
      assert.strictEqual(isComponent(undefined), false);
    });
  });
};

/**
 * Registers tests for isDecorator.
 */
const registerIsDecoratorTests = (): void => {
  suite("isDecorator", () => {
    const cases: [DecoratorType, boolean, string][] = [
      [DecoratorType.INPUT, true, "matching decorator type"],
      [DecoratorType.OUTPUT, false, "non-matching decorator type"],
    ];
    cases.forEach(([type, expected, desc]) => {
      test(`should return ${expected} for ${desc}`, () => {
        const source = createSource("@Input() prop: string;");
        const decNode = findNode(source, ts.isDecorator);
        assert.ok(decNode);
        assert.strictEqual(isDecorator(decNode, type), expected);
      });
    });
  });
};

/**
 * Registers tests for isDirective.
 */
const registerIsDirectiveTests = (): void => {
  suite("isDirective", () => {
    const cases: [string, boolean, string][] = [
      ["@Directive({}) class A {}", true, "Directive decorator"],
      ["@Injectable() class A {}", false, "non-Directive decorator"],
    ];
    cases.forEach(([code, expected, desc]) => {
      test(`should return ${expected} for ${desc}`, () => {
        const source = createSource(code);
        const decNode = findNode(source, ts.isDecorator);
        assert.ok(decNode);
        assert.strictEqual(isDirective(decNode), expected);
      });
    });
    test("should return false for undefined decorator", () => {
      assert.strictEqual(isDirective(undefined), false);
    });
  });
};

/**
 * Defines identifier test cases and runs them.
 */
const registerIsIdentifierCoreTests = (): void => {
  test("should return true for matching identifier name", () => {
    const source = createSource("const test = 1;");
    const idNode = findNode(source, ts.isIdentifier);
    assert.ok(idNode);
    assert.strictEqual(isIdentifier(idNode, "test"), true);
  });
  test("should return false for undefined node", () => {
    assert.strictEqual(
      isIdentifier(undefined as unknown as ts.Node, "test"),
      false
    );
  });
  test("should return false for non-matching identifier", () => {
    const source = createSource("const test = 1;");
    const idNode = findNode(source, ts.isIdentifier);
    assert.ok(idNode);
    assert.strictEqual(isIdentifier(idNode, "other"), false);
  });
  test("should return false for numeric literal node", () => {
    const source = createSource("const x = 1;");
    const node = findNode(source, ts.isNumericLiteral);
    assert.ok(node);
    assert.strictEqual(isIdentifier(node, "x"), false);
  });
};

/**
 * Registers tests for isIdentifier.
 */
const registerIsIdentifierTests = (): void => {
  suite("isIdentifier", registerIsIdentifierCoreTests);
};

/**
 * Registers tests for isPipe.
 */
const registerIsPipeTests = (): void => {
  suite("isPipe", () => {
    const cases: [string, boolean, string][] = [
      ["@Pipe({}) class A {}", true, "Pipe decorator"],
      ["@Injectable() class A {}", false, "non-Pipe decorator"],
    ];
    cases.forEach(([code, expected, desc]) => {
      test(`should return ${expected} for ${desc}`, () => {
        const source = createSource(code);
        const decNode = findNode(source, ts.isDecorator);
        assert.ok(decNode);
        assert.strictEqual(isPipe(decNode), expected);
      });
    });
    test("should return false for undefined decorator", () => {
      assert.strictEqual(isPipe(undefined), false);
    });
  });
};

/**
 * Registers tests for isPropertyOrGetAccessor.
 */
const registerIsPropertyOrGetAccessorTests = (): void => {
  suite("isPropertyOrGetAccessor", () => {
    IS_PROPERTY_OR_GET_CASES.forEach(([code, pred, expected, desc]) => {
      test(`should return ${expected} for ${desc}`, () => {
        const source = createSource(code);
        const node = findNode(source, pred);
        assert.ok(node);
        assert.strictEqual(isPropertyOrGetAccessor(node), expected);
      });
    });
  });
};

suite("nodes", () => {
  registerFindAssignedPropertyTests();
  registerGetAliasNameTests();
  registerGetClassNameTests();
  registerGetReferenceTypeNameTests();
  registerGetTypeNameTests();
  registerIsComponentTests();
  registerIsDecoratorTests();
  registerIsDirectiveTests();
  registerIsIdentifierTests();
  registerIsPipeTests();
  registerIsPropertyOrGetAccessorTests();
});
