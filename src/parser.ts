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

import * as ts from "typescript";

import { ArtifactKind } from "./constants";
import * as nodes from "./nodes";
import {
  AngularInfo,
  DecoratorType,
  IComponentInfo,
  IDirectiveInfo,
  IPipeInfo,
  IProperty,
  NAME_PROPERTY,
  SELECTOR_PROPERTY,
} from "./types";

/**
 * Builds AngularInfo from a class declaration by detecting its decorator type.
 * @param classNode - The class declaration node.
 * @param sourceCode - The source file for type extraction.
 * @returns The Angular info or undefined if no matching decorator found.
 */
const buildAngularInfo = (
  classNode: ts.ClassDeclaration,
  sourceCode: ts.SourceFile
): AngularInfo | undefined => {
  if (findDecorator(classNode, nodes.isComponent)) {
    return buildComponentInfo(classNode, sourceCode);
  }
  if (findDecorator(classNode, nodes.isDirective)) {
    return buildDirectiveInfo(classNode, sourceCode);
  }
  if (findDecorator(classNode, nodes.isPipe)) {
    return buildPipeInfo(classNode);
  }
  return undefined;
};

/**
 * Builds component info from a class declaration.
 * @param classNode - The class declaration node.
 * @param sourceCode - The source file for type extraction.
 * @returns The component info object.
 */
const buildComponentInfo = (
  classNode: ts.ClassDeclaration,
  sourceCode: ts.SourceFile
): IComponentInfo => ({
  kind: ArtifactKind.COMPONENT,
  className: nodes.getClassName(classNode),
  selector: getSelectorName(classNode, nodes.isComponent),
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
 * Builds directive info from a class declaration.
 * @param classNode - The class declaration node.
 * @param sourceCode - The source file for type extraction.
 * @returns The directive info object.
 */
const buildDirectiveInfo = (
  classNode: ts.ClassDeclaration,
  sourceCode: ts.SourceFile
): IDirectiveInfo => ({
  kind: ArtifactKind.DIRECTIVE,
  className: nodes.getClassName(classNode),
  selector: getSelectorName(classNode, nodes.isDirective),
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
 * Builds pipe info from a class declaration.
 * @param classNode - The class declaration node.
 * @returns The pipe info object.
 */
const buildPipeInfo = (classNode: ts.ClassDeclaration): IPipeInfo => ({
  kind: ArtifactKind.PIPE,
  className: nodes.getClassName(classNode),
  name: getPipeName(classNode),
});

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
 * Creates a property descriptor from a decorator and its class member.
 * @param decorator - The decorator node.
 * @param member - The class member node.
 * @param sourceCode - The source file for type extraction.
 * @returns The extracted property descriptor.
 */
const decoratorToProperty = (
  decorator: ts.Decorator,
  member: ts.PropertyDeclaration | ts.GetAccessorDeclaration,
  sourceCode: ts.SourceFile
): IProperty => ({
  name:
    nodes.getAliasName(decorator.expression) ||
    (ts.isIdentifier(member.name) ? member.name.text : ""),
  type: nodes.getTypeName(member, sourceCode),
});

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
): IProperty[] => {
  const result: IProperty[] = [];
  for (const member of classNode.members.filter(
    nodes.isPropertyOrGetAccessor
  )) {
    for (const d of ts.getDecorators(member) ?? []) {
      if (nodes.isDecorator(d, decoratorType)) {
        result.push(decoratorToProperty(d, member, sourceCode));
      }
    }
  }
  return result;
};

/**
 * Extracts a string property value from a decorator.
 * @param decorator - The decorator node.
 * @param propertyName - The property name to extract.
 * @returns The property value or empty string if not found.
 */
const extractStringPropertyFromDecorator = (
  decorator: ts.Decorator,
  propertyName: string
): string => {
  if (!ts.isCallOrNewExpression(decorator.expression)) {
    return "";
  }
  for (const arg of decorator.expression.arguments ?? []) {
    if (!ts.isObjectLiteralExpression(arg)) {
      continue;
    }
    const prop = nodes.findAssignedProperty(arg, propertyName);
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
 * Finds a decorator of the specified type on a class.
 * @param node - The class declaration node.
 * @param predicate - The decorator predicate function.
 * @returns The decorator or undefined.
 */
const findDecorator = (
  node: ts.ClassDeclaration,
  predicate: (d: ts.Decorator | undefined) => boolean
): ts.Decorator | undefined => {
  if (!ts.canHaveDecorators(node)) {
    return undefined;
  }
  return ts.getDecorators(node)?.find(predicate);
};

/**
 * Finds the first class declaration in a source file.
 * @param sourceCode - The source file to search.
 * @returns The first class declaration or undefined.
 */
const findFirstClass = (
  sourceCode: ts.SourceFile
): ts.ClassDeclaration | undefined => {
  let result: ts.ClassDeclaration | undefined;
  /**
   * Visits each node searching for a class declaration.
   * @param node - The node to visit.
   */
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
 * Gets the pipe name from a class declaration.
 * @param node - The class declaration node.
 * @returns The pipe name or empty string.
 */
const getPipeName = (node: ts.ClassDeclaration): string => {
  const decorator = findDecorator(node, nodes.isPipe);
  return decorator
    ? extractStringPropertyFromDecorator(decorator, NAME_PROPERTY)
    : "";
};

/**
 * Gets the component/directive selector from a class declaration.
 * @param node - The class declaration node.
 * @param predicate - The decorator predicate function.
 * @returns The selector value or empty string.
 */
const getSelectorName = (
  node: ts.ClassDeclaration,
  predicate: (d: ts.Decorator | undefined) => boolean
): string => {
  const decorator = findDecorator(node, predicate);
  return decorator
    ? extractStringPropertyFromDecorator(decorator, SELECTOR_PROPERTY)
    : "";
};

/**
 * Parses TypeScript source code to extract any Angular artifact information.
 * Detects components, directives, and pipes.
 * @param fileData - The TypeScript source code string.
 * @returns The Angular info or undefined if no Angular artifact found.
 */
export const parseAngularFile = (fileData = ""): AngularInfo | undefined => {
  const sourceCode = createSourceFile(fileData);
  if (!sourceCode) {
    return undefined;
  }
  const classNode = findFirstClass(sourceCode);
  return classNode ? buildAngularInfo(classNode, sourceCode) : undefined;
};

/**
 * Parses TypeScript source code to extract Angular component information.
 * @param fileData - The TypeScript source code string.
 * @returns The component information or undefined if no component found.
 */
export const parseComponent = (fileData = ""): IComponentInfo | undefined => {
  const sourceCode = createSourceFile(fileData);
  if (!sourceCode) {
    return undefined;
  }
  const classNode = findFirstClass(sourceCode);
  if (!classNode) {
    return undefined;
  }
  const decorator = findDecorator(classNode, nodes.isComponent);
  return decorator ? buildComponentInfo(classNode, sourceCode) : undefined;
};

/**
 * Parses TypeScript source code to extract Angular directive information.
 * @param fileData - The TypeScript source code string.
 * @returns The directive information or undefined if no directive found.
 */
export const parseDirective = (fileData = ""): IDirectiveInfo | undefined => {
  const sourceCode = createSourceFile(fileData);
  if (!sourceCode) {
    return undefined;
  }
  const classNode = findFirstClass(sourceCode);
  if (!classNode) {
    return undefined;
  }
  const decorator = findDecorator(classNode, nodes.isDirective);
  return decorator ? buildDirectiveInfo(classNode, sourceCode) : undefined;
};

/**
 * Parses TypeScript source code to extract Angular pipe information.
 * @param fileData - The TypeScript source code string.
 * @returns The pipe information or undefined if no pipe found.
 */
export const parsePipe = (fileData = ""): IPipeInfo | undefined => {
  const sourceCode = createSourceFile(fileData);
  if (!sourceCode) {
    return undefined;
  }
  const classNode = findFirstClass(sourceCode);
  if (!classNode) {
    return undefined;
  }
  const decorator = findDecorator(classNode, nodes.isPipe);
  return decorator ? buildPipeInfo(classNode) : undefined;
};
