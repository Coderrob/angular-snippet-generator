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

import * as strings from './strings';
import { ComponentInfo, DataType, Property, Snippet } from './types';

const INDENT = '  ';
const FUNCTION_PREFIX = 'on';

/**
 * @param {string|undefined} value -
 * @returns {string}
 */
function formatToFunctionName(value: string | undefined = ''): string {
  if (!value) {
    return value;
  }
  return `${FUNCTION_PREFIX}${strings.upperCaseFirstCharacter(value)}`;
}

/**
 * @param {string} name
 * @returns {string}
 */
function formatComponentName(name: string = ''): string {
  return (
    name
      .match(/[A-Z][a-z]+/g)
      ?.map(strings.upperCaseFirstCharacter)
      .filter(Boolean)
      .join(' ') ?? ''
  );
}

/**
 *
 * @param property
 * @param index
 * @returns
 */
function propertyToAttribute(property: Property, index: number): string {
  const { name, type } = property;
  const nameAssignment = `${INDENT}[${name}]=`;
  const typeValues = getTypeValues(type);
  return !typeValues
    ? nameAssignment + `\"$${index}\"`
    : nameAssignment + ['"${', index, typeValues, '}"'].join('');
}

/**
 *
 * @param property
 * @param index
 * @returns
 */
export function propertyToFunction(property: Property, index: number): string {
  const { name } = property;
  const funcName = formatToFunctionName(name);
  return `${INDENT}(${name})=\"$${index}:${funcName}($event)\"`;
}

/**
 *
 * @param type
 * @returns
 */
export function getTypeValues(type: string | DataType | undefined): string {
  switch (type) {
    case DataType.BOOLEAN:
      return '|true,false|';
    case DataType.NUMBER:
    case DataType.OBJECT:
    case DataType.STRING:
    default:
      return '';
  }
}

/**
 *
 * @param component
 * @returns
 */
export function createSnippet(component: ComponentInfo): Snippet | undefined {
  const { className, selector, inputs, outputs } = component;
  const title = strings.kebabToTitleCase(selector);
  let tabIndex = 0;

  /**
   * @param {}
   * @returns {(string)[]} returns a string of formatted properties
   * converted to html markup using the provided parser delegate.
   */
  const createSafeMarkup = (
    properties: Property[],
    parser: Function
  ): string[] => {
    if (!properties || !parser) {
      return [];
    }
    return properties
      .filter((property) => property?.name)
      .map((property) => parser(property, ++tabIndex));
  };
  return {
    [title]: {
      body: [
        `<${selector} `,
        ...createSafeMarkup(inputs, propertyToAttribute),
        ...createSafeMarkup(outputs, propertyToFunction),
        `></${selector}>`,
        `$${++tabIndex}`,
      ].filter(Boolean),
      description: `A code snippet for ${formatComponentName(className)}.`,
      prefix: [selector],
      scope: 'html',
    },
  };
}
