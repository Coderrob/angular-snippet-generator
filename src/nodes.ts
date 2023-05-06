/**
 * MIT License
 * Copyright (c) 2023 Rob "Coderrob" Lindley
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

import ts from 'typescript';
import {
  DataType,
  DecoratorType,
  DEFAULT_DATA_TYPE,
  EVENT_EMITTER_TYPE,
} from './types';

/**
 * @param node
 */
export function isPropertyOrGetAccessor(
  node: ts.Node
): node is ts.PropertyDeclaration | ts.GetAccessorDeclaration {
  return !!node && (ts.isPropertyDeclaration(node) || ts.isGetAccessor(node));
}

/**
 *
 * @param node
 * @param propertyName
 * @returns
 */
export function findAssignedProperty(
  node: ts.Node,
  propertyName: string
): ts.Node | undefined {
  if (!ts.isObjectLiteralExpression(node)) {
    return;
  }
  return node?.properties?.find(
    (property: ts.ObjectLiteralElementLike) =>
      !!property &&
      ts.isPropertyAssignment(property) &&
      (ts.isIdentifier(property.name) ||
        ts.isPrivateIdentifier(property.name)) &&
      property.name?.text === propertyName
  );
}

/**
 * @param {ts.Node} node - The node to check for a match by name.
 * @param {string} name - The name of the identifier
 */
export function isIdentifier(
  node: ts.Node,
  name: string
): node is ts.Identifier | ts.PrivateIdentifier {
  return !!node && ts.isIdentifier(node) && ts.idText(node) === name;
}

/**
 * @param {ts.Node} node
 * @param {DecoratorType} type
 */
export function isDecorator(
  node: ts.Node,
  type: DecoratorType
): node is ts.Decorator {
  if (!ts.isDecorator(node) || !ts.isCallExpression(node.expression)) {
    return false;
  }
  return isIdentifier(node.expression?.expression, type);
}

/**
 * @param {ts.Node} node
 */
export function isComponent(node: ts.Decorator): boolean {
  if (!node || !ts.isCallExpression(node.expression)) {
    return false;
  }
  return isIdentifier(node.expression?.expression, DecoratorType.COMPONENT);
}

/**
 *
 * @param node
 * @param sourceCode
 * @returns
 */
export function getTypeName(node: ts.Node, sourceCode: ts.SourceFile): string {
  if (!ts.isPropertySignature(node)) {
    return '';
  }
  const name = node.type
    ? getReferenceTypeName(node, sourceCode)
    : getLiteralTypeName(node, sourceCode);
  return isMarkedUndefined(node) ? `${name}|undefined` : name;
}

/**
 * @param property
 */
export function isMarkedUndefined(
  property: ts.PropertySignature | undefined
): boolean {
  return !!property?.questionToken;
}

/**
 *
 */
export function getAliasName(node: ts.Node): string {
  if (!ts.isCallExpression(node)) {
    return '';
  }
  const [aliasNode] = node?.arguments ?? [];
  if (!aliasNode || !ts.isStringLiteral(aliasNode)) {
    return '';
  }
  return aliasNode.text;
}

/**
 * @param {ts.ClassDeclaration|undefined} node
 */
export function getClassName(node: ts.Node): string {
  if (!node || !ts.isClassDeclaration(node)) {
    return '';
  }
  return node.name?.text ?? '';
}

export function getReferenceTypeName(
  node: ts.Node,
  sourceCode: ts.SourceFile
): string {
  if (!node) {
    return DEFAULT_DATA_TYPE;
  }
  if (!ts.isPropertyDeclaration(node) || !node.type) {
    return DEFAULT_DATA_TYPE;
  }
  if (!ts.isTypeReferenceNode(node.type)) {
    return node.type.getText(sourceCode) || DEFAULT_DATA_TYPE;
  }
  const entityName = node.type?.typeName;
  if (!entityName || !ts.isIdentifier(entityName)) {
    return DEFAULT_DATA_TYPE;
  }
  if (entityName.getText(sourceCode) !== EVENT_EMITTER_TYPE) {
    const [type] = node.type.typeArguments ?? [];
    return type.getText(sourceCode) || DEFAULT_DATA_TYPE;
  }
  return entityName.getText(sourceCode) || DEFAULT_DATA_TYPE;
}

export function getLiteralTypeName(
  node: ts.Node,
  sourceCode: ts.SourceFile
): string {
  if (!node || !ts.isVariableDeclaration(node)) {
    return DEFAULT_DATA_TYPE;
  }
  if (!ts.isPropertyDeclaration(node)) {
    return DEFAULT_DATA_TYPE;
  }
  const initializer: ts.Node | undefined = node;
  if (!initializer) {
    return DEFAULT_DATA_TYPE;
  }
  if (ts.isStringLiteral(initializer)) {
    return DataType.STRING;
  }
  if (ts.isNumericLiteral(initializer)) {
    return DataType.NUMBER;
  }
  if (ts.isLiteralTypeNode(initializer)) {
    switch (initializer.literal.kind) {
      case ts.SyntaxKind.StringLiteral:
        return DataType.STRING;
      case ts.SyntaxKind.NumericLiteral:
        return DataType.NUMBER;
      case ts.SyntaxKind.TrueKeyword:
      case ts.SyntaxKind.FalseKeyword:
        return DataType.BOOLEAN;
      default:
        return DEFAULT_DATA_TYPE;
    }
  }
  if (ts.isArrayLiteralExpression(initializer)) {
    const [typeNode] = initializer?.elements ?? [];
    const elementType = typeNode
      ? getLiteralTypeName(typeNode, sourceCode)
      : DEFAULT_DATA_TYPE;
    return `${elementType}[]`;
  }
  return DEFAULT_DATA_TYPE;
}
