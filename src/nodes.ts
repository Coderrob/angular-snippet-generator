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

import ts from "typescript";

import { DecoratorType, DEFAULT_DATA_TYPE, EVENT_EMITTER_TYPE } from "./types";

/**
 * Type guard to check if a node is a property declaration or get accessor.
 * @param node - The TypeScript AST node to check.
 * @returns True if the node is a property declaration or get accessor.
 */
export const isPropertyOrGetAccessor = (
  node: ts.Node
): node is ts.PropertyDeclaration | ts.GetAccessorDeclaration =>
  !!node && (ts.isPropertyDeclaration(node) || ts.isGetAccessor(node));

/**
 * Finds a property assignment by name within an object literal expression.
 * @param node - The object literal expression node.
 * @param propertyName - The property name to find.
 * @returns The found property node or undefined.
 */
export const findAssignedProperty = (
  node: ts.Node,
  propertyName: string
): ts.Node | undefined => {
  if (!ts.isObjectLiteralExpression(node)) {
    return undefined;
  }
  return node.properties.find(
    (prop): prop is ts.PropertyAssignment =>
      ts.isPropertyAssignment(prop) &&
      (ts.isIdentifier(prop.name) || ts.isPrivateIdentifier(prop.name)) &&
      prop.name.text === propertyName
  );
};

/**
 * Checks if a node is an identifier matching a specific name.
 * @param node - The AST node to check.
 * @param name - The identifier name to match.
 * @returns True if the node is an identifier with the specified name.
 */
export const isIdentifier = (
  node: ts.Node,
  name: string
): node is ts.Identifier =>
  !!node && ts.isIdentifier(node) && ts.idText(node) === name;

/**
 * Checks if a node is a decorator of a specific type.
 * @param node - The AST node to check.
 * @param type - The decorator type to match.
 * @returns True if the node is a decorator of the specified type.
 */
export const isDecorator = (
  node: ts.Node,
  type: DecoratorType
): node is ts.Decorator =>
  ts.isDecorator(node) &&
  ts.isCallExpression(node.expression) &&
  isIdentifier(node.expression.expression, type);

/**
 * Checks if a decorator is an Angular @Component decorator.
 * @param node - The decorator node to check.
 * @returns True if the decorator is a Component decorator.
 */
export const isComponent = (node: ts.Decorator): boolean =>
  !!node &&
  ts.isCallExpression(node.expression) &&
  isIdentifier(node.expression.expression, DecoratorType.COMPONENT);

/**
 * Checks if a decorator is an Angular @Directive decorator.
 * @param node - The decorator node to check.
 * @returns True if the decorator is a Directive decorator.
 */
export const isDirective = (node: ts.Decorator): boolean =>
  !!node &&
  ts.isCallExpression(node.expression) &&
  isIdentifier(node.expression.expression, DecoratorType.DIRECTIVE);

/**
 * Checks if a decorator is an Angular @Pipe decorator.
 * @param node - The decorator node to check.
 * @returns True if the decorator is a Pipe decorator.
 */
export const isPipe = (node: ts.Decorator): boolean =>
  !!node &&
  ts.isCallExpression(node.expression) &&
  isIdentifier(node.expression.expression, DecoratorType.PIPE);

/**
 * Extracts the alias name from a decorator call expression.
 * @param node - The call expression node.
 * @returns The alias string or empty string if not found.
 */
export const getAliasName = (node: ts.Node): string => {
  if (!ts.isCallExpression(node)) {
    return "";
  }
  const [aliasNode] = node.arguments ?? [];
  return aliasNode && ts.isStringLiteral(aliasNode) ? aliasNode.text : "";
};

/**
 * Extracts the class name from a class declaration node.
 * @param node - The AST node to extract the class name from.
 * @returns The class name or empty string if not a class declaration.
 */
export const getClassName = (node: ts.Node): string =>
  node && ts.isClassDeclaration(node) ? (node.name?.text ?? "") : "";

/**
 * Checks if a node is a property declaration or get accessor.
 * @param node - The node to check.
 * @returns True if the node is a property declaration or get accessor.
 */
const isPropertyLike = (
  node: ts.Node
): node is ts.PropertyDeclaration | ts.GetAccessorDeclaration =>
  ts.isPropertyDeclaration(node) || ts.isGetAccessorDeclaration(node);

/**
 * Gets the type node from a property-like declaration.
 * @param node - The property or get accessor node.
 * @returns The type node or undefined.
 */
const getTypeNode = (
  node: ts.PropertyDeclaration | ts.GetAccessorDeclaration
): ts.TypeNode | undefined => node.type;

/**
 * Extracts the type name from a property declaration with a type reference.
 * @param node - The property declaration or get accessor node.
 * @param sourceCode - The source file for text extraction.
 * @returns The resolved type name or default data type.
 */
export const getReferenceTypeName = (
  node: ts.Node,
  sourceCode: ts.SourceFile
): string => {
  if (!node || !isPropertyLike(node)) {
    return DEFAULT_DATA_TYPE;
  }

  const typeNode = getTypeNode(node);
  if (!typeNode) {
    return DEFAULT_DATA_TYPE;
  }

  if (!ts.isTypeReferenceNode(typeNode)) {
    return typeNode.getText(sourceCode) || DEFAULT_DATA_TYPE;
  }

  const entityName = typeNode.typeName;
  if (!entityName || !ts.isIdentifier(entityName)) {
    return DEFAULT_DATA_TYPE;
  }

  const typeName = entityName.getText(sourceCode);
  const [typeArg] = typeNode.typeArguments ?? [];

  // For EventEmitter<T>, extract T; otherwise return the type or its argument
  if (typeName === EVENT_EMITTER_TYPE) {
    return typeArg?.getText(sourceCode) || DEFAULT_DATA_TYPE;
  }

  return typeArg?.getText(sourceCode) || typeName || DEFAULT_DATA_TYPE;
};

/**
 * Determines the type name from a property's type annotation or declaration.
 * @param node - The property node.
 * @param sourceCode - The source file for text extraction.
 * @returns The resolved type name.
 */
export const getTypeName = (
  node: ts.Node,
  sourceCode: ts.SourceFile
): string =>
  ts.isPropertyDeclaration(node) || ts.isGetAccessorDeclaration(node)
    ? getReferenceTypeName(node, sourceCode)
    : "";

/** Mapping of boolean type values for snippet completion. */
export const BOOLEAN_VALUES = "|true,false|" as const;
