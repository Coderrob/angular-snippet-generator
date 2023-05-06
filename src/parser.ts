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

import * as ts from 'typescript';
import * as nodes from './nodes';
import {
  ComponentInfo,
  DecoratorType,
  Property,
  SELECTOR_PROPERTY,
} from './types';

const { log } = console;

/**
 * Gets the root node of an abstract syntax tree from the TypeScript's
 * file contents.
 *
 * @param {string|undefined} sourceText = string contents of an a TypeScript file
 * @returns {ts.SourceFile|undefined} the root node of the TypeScript file's AST; otherwise returns undefined.
 */
function getTypeScriptSource(sourceText = ''): ts.SourceFile | undefined {
  if (!sourceText) {
    return;
  }
  return ts.createSourceFile(
    'temp.ts', // Temporary file name
    sourceText,
    ts.ScriptTarget.Latest,
    true, // start source code node at root node
    ts.ScriptKind.TS // the type of file content being read
  );
}

/**
 * Walk through the component decorator's properties looking
 * for the selector property and its value. When found the selector
 * value will be sent back to the caller.
 *
 * @param node
 * @returns The component selector property value; otherwise returns an empty string.
 */
function getSelectorName(node: ts.Node): string {
  if (!ts.isClassDeclaration(node) || !ts.canHaveDecorators(node)) {
    return '';
  }
  const decorator = ts.getDecorators(node)?.find(nodes.isComponent);
  if (!decorator) {
    return '';
  }
  /**
   * Iterate through the component decorator's properties looking
   * for the selector property, and then return its value when
   * found; otherwise returns an empty string.
   */
  if (!ts.isCallOrNewExpression(decorator.expression)) {
    return '';
  }
  for (const argument of decorator.expression?.arguments ?? []) {
    if (!ts.isObjectLiteralExpression(argument)) {
      continue;
    }
    const property = nodes.findAssignedProperty(argument, SELECTOR_PROPERTY);
    if (!property) {
      continue;
    }
    if (
      !ts.isPropertyAssignment(property) ||
      !ts.isStringLiteralLike(property.initializer)
    ) {
      continue;
    }

    const selectorName = property.initializer?.text ?? '';
    if (!selectorName) {
      continue;
    }
    return selectorName;
  }
  return '';
}

/**
 * @param node
 * @param type
 * @param sourceCode
 */
function getDecoratorProperties(
  node: ts.Node,
  type: DecoratorType,
  sourceCode: ts.SourceFile
): Property[] {
  const names: Property[] = [];
  if (!ts.isClassDeclaration(node)) {
    return names;
  }
  node.members?.filter(nodes.isPropertyOrGetAccessor).forEach((member) =>
    ts
      .getDecorators(member)
      ?.filter((decorator: ts.Node) => nodes.isDecorator(decorator, type))
      .forEach((decorator: ts.Decorator) => {
        /**
         * Use the alias over property identifier to cover case
         * when an alias is set in @Input('alias') or @Output('alias').
         */
        const name = ts.isIdentifier(member.name) ? member.name?.text : '';
        names.push({
          name: nodes.getAliasName(decorator.expression) || name,
          type: nodes.getTypeName(member, sourceCode),
        });
      })
  );
  return names;
}

/**
 * Gets the first component's metadata information
 * found within a source code file.
 *
 * The assumption here is that a component's TypeScript
 * file should contain only one component
 *
 * @param sourceCode
 * @returns an array of component info objects for components found in the source code; otherwise an empty array.
 */
function getComponentInfo(
  sourceCode: ts.SourceFile
): ComponentInfo | undefined {
  const components: ComponentInfo[] = [];
  function visit(node: ts.Node): void {
    if (!node) {
      return;
    }
    /**
     * Walk the abstract syntax tree until the first class
     * identifier is found.
     *
     * This makes assumptions that the component class should
     * be only class contained within the TypeScript file. There
     * may be constants, enums, types, or interfaces at the same
     * level but only one class.
     */
    if (!ts.isClassDeclaration(node)) {
      ts.forEachChild(node, visit);
      return;
    }
    const component: ComponentInfo = {
      className: nodes.getClassName(node),
      selector: getSelectorName(node),
      inputs: getDecoratorProperties(node, DecoratorType.INPUT, sourceCode),
      outputs: getDecoratorProperties(node, DecoratorType.OUTPUT, sourceCode),
    };

    // todo - add component validation
    components.push(component);
  }
  visit(sourceCode);
  /**
   * Support here for multiple components within a source file
   * but keeping to expectations of one component per TypeScript
   * file.
   */
  return components[0];
}

/**
 * @param fileData The string data to parse for input and output properties.
 * @returns the component information that includes its class
 * name, selector attribute, and both input and output properties collections;
 * otherwise returns undefined if no component information was found.
 */
export function parseComponent(fileData = ''): ComponentInfo | undefined {
  const sourceCode: ts.SourceFile | undefined = getTypeScriptSource(fileData);
  if (!sourceCode) {
    return;
  }
  return getComponentInfo(sourceCode);
}
