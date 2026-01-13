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

import { ArtifactKind } from "./constants";
import { kebabToTitleCase, upperCaseFirstCharacter } from "./strings";
import {
  AngularInfo,
  ComponentInfo,
  DataType,
  DirectiveInfo,
  PipeInfo,
  Property,
  Snippet,
} from "./types";

/** Indentation for snippet body attributes. */
const INDENT = "  ";

/** Prefix for generated event handler function names. */
const FUNCTION_PREFIX = "on";

/**
 * Converts an event name to a handler function name (e.g., "click" -> "onClick").
 * @param value - The event name to convert.
 * @returns The formatted function name with "on" prefix.
 */
export const formatToFunctionName = (value = ""): string =>
  value ? `${FUNCTION_PREFIX}${upperCaseFirstCharacter(value)}` : value;

/**
 * Extracts a readable component name from a class name.
 * Splits PascalCase into separate words (e.g., "SaveCancelButtonComponent" -> "Save Cancel Button Component").
 * @param name - The class name to format.
 * @returns The formatted display name.
 */
export const formatComponentName = (name = ""): string =>
  name.match(/[A-Z][a-z]+/g)?.join(" ") ?? "";

/**
 * Returns type-specific completion values for boolean types.
 * @param type - The property type.
 * @returns The completion choices string or empty string.
 */
export const getTypeValues = (type: string | DataType | undefined): string =>
  type === DataType.BOOLEAN ? "|true,false|" : "";

/**
 * Converts an input property to an HTML attribute string for snippets.
 * @param property - The property to convert.
 * @param index - The tab stop index.
 * @returns The formatted attribute string.
 */
export const propertyToAttribute = (
  property: Property,
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
  property: Property,
  index: number
): string => {
  const { name } = property;
  return `${INDENT}(${name})="$${index}:${formatToFunctionName(name)}($event)"`;
};

/**
 * Maps properties to formatted strings using the provided formatter.
 * @param properties - The properties to format.
 * @param formatter - The formatting function.
 * @param startIndex - The starting tab stop index.
 * @returns Object with formatted strings and updated index.
 */
const mapProperties = (
  properties: readonly Property[],
  formatter: (prop: Property, index: number) => string,
  startIndex: number
): { lines: string[]; nextIndex: number } => {
  const validProps = properties.filter((p) => p?.name);
  const lines = validProps.map((prop, i) =>
    formatter(prop, startIndex + i + 1)
  );
  return { lines, nextIndex: startIndex + validProps.length };
};

/**
 * Creates a VS Code snippet from Angular component information.
 * @param component - The component info to create a snippet from.
 * @returns The snippet object or undefined if component is invalid.
 */
export const createComponentSnippet = (
  component: ComponentInfo
): Snippet | undefined => {
  const { className, selector, inputs, outputs } = component;

  if (!selector) {
    return undefined;
  }

  const title = kebabToTitleCase(selector);
  let tabIndex = 0;

  const inputResult = mapProperties(inputs, propertyToAttribute, tabIndex);
  tabIndex = inputResult.nextIndex;

  const outputResult = mapProperties(outputs, propertyToFunction, tabIndex);
  tabIndex = outputResult.nextIndex;

  return {
    [title]: {
      body: [
        `<${selector} `,
        ...inputResult.lines,
        ...outputResult.lines,
        `></${selector}>`,
        `$${tabIndex + 1}`,
      ],
      description: `A code snippet for ${formatComponentName(className)}.`,
      prefix: [selector],
      scope: "html",
    },
  };
};

/**
 * Cleans a directive selector for use as a snippet prefix.
 * Removes attribute selector brackets (e.g., "[appHighlight]" -> "appHighlight").
 * @param selector - The directive selector.
 * @returns The cleaned selector.
 */
const cleanDirectiveSelector = (selector: string): string =>
  selector.replaceAll(/(?:^\[)|(?:\]$)/g, "");

/**
 * Creates a VS Code snippet from Angular directive information.
 * @param directive - The directive info to create a snippet from.
 * @returns The snippet object or undefined if directive is invalid.
 */
export const createDirectiveSnippet = (
  directive: DirectiveInfo
): Snippet | undefined => {
  const { className, selector, inputs, outputs } = directive;

  if (!selector) {
    return undefined;
  }

  const cleanSelector = cleanDirectiveSelector(selector);
  const title = `${formatComponentName(className)} Directive`;
  let tabIndex = 0;

  const inputResult = mapProperties(inputs, propertyToAttribute, tabIndex);
  tabIndex = inputResult.nextIndex;

  const outputResult = mapProperties(outputs, propertyToFunction, tabIndex);
  tabIndex = outputResult.nextIndex;

  // Directive snippets add attributes to existing elements
  return {
    [title]: {
      body: [
        `${cleanSelector}`,
        ...inputResult.lines,
        ...outputResult.lines,
        `$${tabIndex + 1}`,
      ],
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
export const createPipeSnippet = (pipe: PipeInfo): Snippet | undefined => {
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
export const createSnippet = (info: AngularInfo): Snippet | undefined => {
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
