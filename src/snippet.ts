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

import { ArtifactKind } from "./constants";
import { kebabToTitleCase, upperCaseFirstCharacter } from "./strings";
import {
  AngularInfo,
  DataType,
  IComponentInfo,
  IDirectiveInfo,
  IPipeInfo,
  IProperty,
  ISnippet,
} from "./types";

/** Indentation for snippet body attributes. */
const INDENT = "  ";

/** Prefix for generated event handler function names. */
const FUNCTION_PREFIX = "on";

/**
 * Builds the snippet body lines for a component element.
 * @param selector - The component's element selector.
 * @param inputLines - Formatted input attribute lines.
 * @param outputLines - Formatted output binding lines.
 * @param tabIndex - The final tab stop index.
 * @returns The array of snippet body lines.
 */
const buildComponentBody = (
  selector: string,
  inputLines: string[],
  outputLines: string[],
  tabIndex: number
): string[] => [
  `<${selector} `,
  ...inputLines,
  ...outputLines,
  `></${selector}>`,
  `$${tabIndex + 1}`,
];

/**
 * Builds the snippet body lines for a directive attribute.
 * @param cleanSelector - The cleaned directive selector (without brackets).
 * @param inputLines - Formatted input attribute lines.
 * @param outputLines - Formatted output binding lines.
 * @param tabIndex - The final tab stop index.
 * @returns The array of snippet body lines.
 */
const buildDirectiveBody = (
  cleanSelector: string,
  inputLines: string[],
  outputLines: string[],
  tabIndex: number
): string[] => [
  `${cleanSelector}`,
  ...inputLines,
  ...outputLines,
  `$${tabIndex + 1}`,
];

/**
 * Cleans a directive selector for use as a snippet prefix.
 * Removes attribute selector brackets (e.g., "[appHighlight]" -> "appHighlight").
 * @param selector - The directive selector.
 * @returns The cleaned selector.
 */
const cleanDirectiveSelector = (selector: string): string =>
  selector.replaceAll(/(?:^\[)|(?:\]$)/g, "");

/**
 * Computes input and output property lines and the final tab stop index.
 * @param inputs - The component input properties.
 * @param outputs - The component output properties.
 * @returns An object with input lines, output lines, and the final tab index.
 */
const computeSnippetParts = (
  inputs: readonly IProperty[],
  outputs: readonly IProperty[]
): { inputLines: string[]; outputLines: string[]; finalIndex: number } => {
  let tabIndex = 0;
  const inputResult = mapProperties(inputs, propertyToAttribute, tabIndex);
  tabIndex = inputResult.nextIndex;
  const outputResult = mapProperties(outputs, propertyToFunction, tabIndex);
  return {
    inputLines: inputResult.lines,
    outputLines: outputResult.lines,
    finalIndex: outputResult.nextIndex,
  };
};

/**
 * Creates a VS Code snippet from Angular component information.
 * @param component - The component info to create a snippet from.
 * @returns The snippet object or undefined if component is invalid.
 */
export const createComponentSnippet = (
  component: IComponentInfo
): ISnippet | undefined => {
  if (!component.selector) {
    return undefined;
  }
  const { className, selector, inputs, outputs } = component;
  const title = kebabToTitleCase(selector);
  const { inputLines, outputLines, finalIndex } = computeSnippetParts(
    inputs,
    outputs
  );
  return {
    [title]: {
      body: buildComponentBody(selector, inputLines, outputLines, finalIndex),
      description: `A code snippet for ${formatComponentName(className)}.`,
      prefix: [selector],
      scope: "html",
    },
  };
};

/**
 * Creates a VS Code snippet from Angular directive information.
 * @param directive - The directive info to create a snippet from.
 * @returns The snippet object or undefined if directive is invalid.
 */
export const createDirectiveSnippet = (
  directive: IDirectiveInfo
): ISnippet | undefined => {
  if (!directive.selector) {
    return undefined;
  }
  const { className, selector, inputs, outputs } = directive;
  const cleanSelector = cleanDirectiveSelector(selector);
  const title = `${formatComponentName(className)} Directive`;
  const parts = computeSnippetParts(inputs, outputs);
  return {
    [title]: {
      body: buildDirectiveBody(
        cleanSelector,
        parts.inputLines,
        parts.outputLines,
        parts.finalIndex
      ),
      description: `A directive snippet for ${formatComponentName(className)}.`,
      prefix: [cleanSelector],
      scope: "html",
    },
  };
};

/**
 * Creates a VS Code snippet from Angular pipe information.
 * @param pipe - The pipe info to create a snippet from.
 * @returns The snippet object or undefined if pipe is invalid.
 */
export const createPipeSnippet = (pipe: IPipeInfo): ISnippet | undefined => {
  const { className, name } = pipe;
  if (!name) {
    return undefined;
  }
  const title = `${formatComponentName(className)} Pipe`;
  return {
    [title]: {
      body: [`{{ $1 | ${name}$2 }}`],
      description: `A pipe snippet for ${formatComponentName(className)}.`,
      prefix: [name, `| ${name}`],
      scope: "html",
    },
  };
};

/**
 * Creates a VS Code snippet from any Angular artifact information.
 * @param info - The Angular info to create a snippet from.
 * @returns The snippet object or undefined if info is invalid.
 */
export const createSnippet = (info: AngularInfo): ISnippet | undefined => {
  switch (info.kind) {
    case ArtifactKind.COMPONENT:
      return createComponentSnippet(info);
    case ArtifactKind.DIRECTIVE:
      return createDirectiveSnippet(info);
    case ArtifactKind.PIPE:
      return createPipeSnippet(info);
    default:
      return undefined;
  }
};

/**
 * Extracts a readable component name from a class name.
 * Splits PascalCase into separate words (e.g., "SaveCancelButtonComponent" -> "Save Cancel Button Component").
 * @param name - The class name to format.
 * @returns The formatted display name.
 */
export const formatComponentName = (name = ""): string =>
  name.match(/[A-Z][a-z]+/g)?.join(" ") ?? "";

/**
 * Converts an event name to a handler function name (e.g., "click" -> "onClick").
 * @param value - The event name to convert.
 * @returns The formatted function name with "on" prefix.
 */
export const formatToFunctionName = (value = ""): string =>
  value ? `${FUNCTION_PREFIX}${upperCaseFirstCharacter(value)}` : value;

/**
 * Returns type-specific completion values for boolean types.
 * @param type - The property type.
 * @returns The completion choices string or empty string.
 */
export const getTypeValues = (type: string | DataType | undefined): string =>
  type === DataType.BOOLEAN ? "|true,false|" : "";

/**
 * Checks if a property has a non-empty name.
 * @param p - The property to check.
 * @returns True if the property has a name.
 */
const hasName = (p: IProperty): boolean => !!p?.name;

/**
 * Maps properties to formatted strings using the provided formatter.
 * @param properties - The properties to format.
 * @param formatter - The formatting function.
 * @param startIndex - The starting tab stop index.
 * @returns Object with formatted strings and updated index.
 */
const mapProperties = (
  properties: readonly IProperty[],
  formatter: (prop: IProperty, index: number) => string,
  startIndex: number
): { lines: string[]; nextIndex: number } => {
  /**
   * Formats a property at its calculated tab stop index.
   * @param prop - The property to format.
   * @param i - The index offset within the batch.
   * @returns The formatted property string.
   */
  const formatAtIndex = (prop: IProperty, i: number): string =>
    formatter(prop, startIndex + i + 1);
  const validProps = properties.filter(hasName);
  return {
    lines: validProps.map(formatAtIndex),
    nextIndex: startIndex + validProps.length,
  };
};

/**
 * Converts an input property to an HTML attribute string for snippets.
 * @param property - The property to convert.
 * @param index - The tab stop index.
 * @returns The formatted attribute string.
 */
export const propertyToAttribute = (
  property: IProperty,
  index: number
): string => {
  const { name, type } = property;
  const typeValues = getTypeValues(type);
  const value = typeValues ? `"\${${index}${typeValues}}"` : `"$${index}"`;
  return `${INDENT}[${name}]=${value}`;
};

/**
 * Converts an output property to an event binding string for snippets.
 * @param property - The property to convert.
 * @param index - The tab stop index.
 * @returns The formatted event binding string.
 */
export const propertyToFunction = (
  property: IProperty,
  index: number
): string => {
  const { name } = property;
  return `${INDENT}(${name})="$${index}:${formatToFunctionName(name)}($event)"`;
};
