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

import * as ts from "typescript";

import * as nodes from "./nodes";
import {
  ComponentInfo,
  DecoratorType,
  Property,
  SELECTOR_PROPERTY,
} from "./types";

/**
 * Creates a TypeScript source file from source text.
 * @param sourceText - The TypeScript source code string.
 * @returns The parsed source file or undefined if empty.
 */
const createSourceFile = (sourceText = ""): ts.SourceFile | undefined =>
  sourceText
    ? ts.createSourceFile(
        "temp.ts",
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      )
    : undefined;

/**
 * Extracts the selector property value from a component decorator.
 * @param decorator - The component decorator node.
 * @returns The selector string or empty string if not found.
 */
const extractSelectorFromDecorator = (decorator: ts.Decorator): string => {
  if (!ts.isCallOrNewExpression(decorator.expression)) {
    return "";
  }

  for (const arg of decorator.expression.arguments ?? []) {
    if (!ts.isObjectLiteralExpression(arg)) {
      continue;
    }

    const prop = nodes.findAssignedProperty(arg, SELECTOR_PROPERTY);
    if (
      prop &&
      ts.isPropertyAssignment(prop) &&
      ts.isStringLiteralLike(prop.initializer)
    ) {
      return prop.initializer.text;
    }
  }
  return "";
};

/**
 * Gets the component selector from a class declaration.
 * @param node - The class declaration node.
 * @returns The selector value or empty string.
 */
const getSelectorName = (node: ts.ClassDeclaration): string => {
  if (!ts.canHaveDecorators(node)) {
    return "";
  }

  const decorator = ts.getDecorators(node)?.find(nodes.isComponent);
  return decorator ? extractSelectorFromDecorator(decorator) : "";
};

/**
 * Extracts properties with a specific decorator type from a class.
 * @param classNode - The class declaration node.
 * @param decoratorType - The decorator type to filter by.
 * @param sourceCode - The source file for type extraction.
 * @returns Array of extracted properties.
 */
const extractDecoratorProperties = (
  classNode: ts.ClassDeclaration,
  decoratorType: DecoratorType,
  sourceCode: ts.SourceFile
): Property[] =>
  classNode.members.filter(nodes.isPropertyOrGetAccessor).flatMap((member) => {
    const decorators = ts.getDecorators(member) ?? [];
    return decorators
      .filter((d): d is ts.Decorator => nodes.isDecorator(d, decoratorType))
      .map((decorator) => ({
        name:
          nodes.getAliasName(decorator.expression) ||
          (ts.isIdentifier(member.name) ? member.name.text : ""),
        type: nodes.getTypeName(member, sourceCode),
      }));
  });

/**
 * Builds component info from a class declaration.
 * @param classNode - The class declaration node.
 * @param sourceCode - The source file for type extraction.
 * @returns The component info object.
 */
const buildComponentInfo = (
  classNode: ts.ClassDeclaration,
  sourceCode: ts.SourceFile
): ComponentInfo => ({
  className: nodes.getClassName(classNode),
  selector: getSelectorName(classNode),
  inputs: extractDecoratorProperties(
    classNode,
    DecoratorType.INPUT,
    sourceCode
  ),
  outputs: extractDecoratorProperties(
    classNode,
    DecoratorType.OUTPUT,
    sourceCode
  ),
});

/**
 * Finds the first class declaration in a source file.
 * @param sourceCode - The source file to search.
 * @returns The first class declaration or undefined.
 */
const findFirstClass = (
  sourceCode: ts.SourceFile
): ts.ClassDeclaration | undefined => {
  let result: ts.ClassDeclaration | undefined;

  const visit = (node: ts.Node): void => {
    if (result) {
      return;
    }
    if (ts.isClassDeclaration(node)) {
      result = node;
      return;
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceCode);
  return result;
};

/**
 * Parses TypeScript source code to extract Angular component information.
 * @param fileData - The TypeScript source code string.
 * @returns The component information or undefined if no component found.
 */
export const parseComponent = (fileData = ""): ComponentInfo | undefined => {
  const sourceCode = createSourceFile(fileData);
  if (!sourceCode) {
    return undefined;
  }

  const classNode = findFirstClass(sourceCode);
  return classNode ? buildComponentInfo(classNode, sourceCode) : undefined;
};
