/**
 * MIT License
 * Copyright (c) 2026 Rob "Coderrob" Lindley
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

suite("nodes", () => {
  suite("isPropertyOrGetAccessor", () => {
    const cases: [string, (n: ts.Node) => n is ts.Node, boolean, string][] = [
      [
        "class A { prop: string; }",
        ts.isPropertyDeclaration as (n: ts.Node) => n is ts.Node,
        true,
        "property declaration",
      ],
      [
        "class A { get prop() { return 1; } }",
        ts.isGetAccessor as (n: ts.Node) => n is ts.Node,
        true,
        "get accessor",
      ],
      [
        "class A { method() {} }",
        ts.isMethodDeclaration as (n: ts.Node) => n is ts.Node,
        false,
        "method declaration",
      ],
    ];
    cases.forEach(([code, pred, expected, desc]) => {
      test(`should return ${expected} for ${desc}`, () => {
        const source = createSource(code);
        const node = findNode(source, pred);
        assert.ok(node);
        assert.strictEqual(isPropertyOrGetAccessor(node), expected);
      });
    });
  });

  suite("findAssignedProperty", () => {
    test("should find property by name in object literal", () => {
      const source = createSource("const x = { selector: 'test' };");
      const objNode = findNode(source, ts.isObjectLiteralExpression);
      assert.ok(objNode && findAssignedProperty(objNode, "selector"));
    });

    const negativeCases: [
      string,
      string,
      string,
      (n: ts.Node) => n is ts.Node,
    ][] = [
      [
        "const x = { selector: 'test' };",
        "notFound",
        "non-existent property",
        ts.isObjectLiteralExpression as (n: ts.Node) => n is ts.Node,
      ],
      [
        "const x = 1;",
        "any",
        "non-object node",
        ts.isVariableDeclaration as (n: ts.Node) => n is ts.Node,
      ],
      [
        "const name = 'x'; const obj = { name };",
        "name",
        "shorthand property",
        ts.isObjectLiteralExpression as (n: ts.Node) => n is ts.Node,
      ],
    ];
    negativeCases.forEach(([code, propName, desc, pred]) => {
      test(`should return undefined for ${desc}`, () => {
        const source = createSource(code);
        const node = findNode(source, pred);
        assert.ok(node);
        assert.strictEqual(findAssignedProperty(node, propName), undefined);
      });
    });
  });

  suite("isIdentifier", () => {
    test("should return true for matching identifier name", () => {
      const source = createSource("const test = 1;");
      const idNode = findNode(source, ts.isIdentifier);
      assert.ok(idNode);
      assert.strictEqual(isIdentifier(idNode, "test"), true);
    });

    const cases: [string | undefined, string, string][] = [
      ["const test = 1;", "other", "non-matching identifier"],
      [undefined, "test", "undefined node"],
      ["const x = 1;", "x", "numeric literal node"],
    ];
    cases.forEach(([code, name, desc]) => {
      test(`should return false for ${desc}`, () => {
        if (!code) {
          assert.strictEqual(
            isIdentifier(undefined as unknown as ts.Node, name),
            false
          );
          return;
        }
        const source = createSource(code);
        const node = desc.includes("numeric")
          ? findNode(source, ts.isNumericLiteral)
          : findNode(source, ts.isIdentifier);
        assert.ok(node);
        assert.strictEqual(isIdentifier(node, name), false);
      });
    });
  });

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
      assert.strictEqual(
        isComponent(undefined as unknown as ts.Decorator),
        false
      );
    });
  });

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
      assert.strictEqual(
        isDirective(undefined as unknown as ts.Decorator),
        false
      );
    });
  });

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
      assert.strictEqual(isPipe(undefined as unknown as ts.Decorator), false);
    });
  });

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
      const varNode = findNode(source, ts.isVariableDeclaration);
      assert.ok(varNode);
      assert.strictEqual(getAliasName(varNode), "");
    });
  });

  suite("getClassName", () => {
    const cases: [string, string, string, (n: ts.Node) => n is ts.Node][] = [
      [
        "class MyClass {}",
        "MyClass",
        "class declaration",
        ts.isClassDeclaration as (n: ts.Node) => n is ts.Node,
      ],
      [
        "const x = 1;",
        "",
        "non-class node",
        ts.isVariableDeclaration as (n: ts.Node) => n is ts.Node,
      ],
      [
        "const x = class {};",
        "",
        "anonymous class",
        ts.isClassExpression as (n: ts.Node) => n is ts.Node,
      ],
    ];
    runNodeTests(cases, getClassName);

    test("should return empty string for undefined node", () => {
      assert.strictEqual(getClassName(undefined as unknown as ts.Node), "");
    });
  });

  suite("getReferenceTypeName", () => {
    const cases: [string, string, string][] = [
      ["class A { prop: string; }", "string", "property with type annotation"],
      [
        "class A { prop: EventEmitter<boolean>; }",
        "boolean",
        "EventEmitter generic",
      ],
      [
        "class A { prop: EventEmitter; }",
        "any",
        "EventEmitter without type arg",
      ],
      ["class A { prop: Namespace.Type; }", "any", "qualified type name"],
      [
        "class A { prop: Observable<string>; }",
        "string",
        "non-EventEmitter generic",
      ],
      [
        "class A { prop: Observable; }",
        "Observable",
        "generic without argument",
      ],
      ["class A { prop: string[]; }", "string[]", "array type syntax"],
      ["class A { prop: string | number; }", "string | number", "union type"],
      ["class A { prop = 'value'; }", "any", "property without type"],
    ];
    cases.forEach(([code, expected, desc]) => {
      test(`should return "${expected}" for ${desc}`, () => {
        const source = createSource(code);
        const propNode = findNode(source, ts.isPropertyDeclaration);
        assert.ok(propNode);
        assert.strictEqual(getReferenceTypeName(propNode, source), expected);
      });
    });

    test("should return default type for non-property node", () => {
      const source = createSource("const x = 1;");
      const varNode = findNode(source, ts.isVariableDeclaration);
      assert.ok(varNode);
      assert.strictEqual(getReferenceTypeName(varNode, source), "any");
    });
  });

  suite("getTypeName", () => {
    const cases: [string, string, string, (n: ts.Node) => n is ts.Node][] = [
      [
        "class A { prop: number; }",
        "number",
        "property declaration",
        ts.isPropertyDeclaration as (n: ts.Node) => n is ts.Node,
      ],
      [
        "class A { get prop(): boolean { return true; } }",
        "boolean",
        "get accessor",
        ts.isGetAccessor as (n: ts.Node) => n is ts.Node,
      ],
      [
        "class A { method() {} }",
        "",
        "method declaration",
        ts.isMethodDeclaration as (n: ts.Node) => n is ts.Node,
      ],
    ];
    runNodeTests(cases, getTypeName);
  });
});
