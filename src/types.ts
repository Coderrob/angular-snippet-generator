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

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Represents an Angular component's metadata extracted from source code.
 */
export interface ComponentInfo {
  /** The class name of the component. */
  readonly className: string;
  /** The component's selector attribute value. */
  readonly selector: string;
  /** The component's @Input decorated properties. */
  readonly inputs: readonly Property[];
  /** The component's @Output decorated properties. */
  readonly outputs: readonly Property[];
}

/**
 * Represents an Angular component property with its name and type.
 */
export interface Property {
  /** The property name or alias. */
  readonly name: string;
  /** The property's TypeScript type. */
  readonly type: string | DataType | undefined;
}

/**
 * Represents a VS Code snippet structure.
 */
export interface Snippet {
  readonly [key: string]: {
    readonly body: readonly string[];
    readonly description: string;
    readonly prefix: readonly string[];
    readonly scope: string;
  };
}

/**
 * Enumeration of property kinds for categorization.
 * Provided for API guidance and extensibility.
 */
export enum PropertyKind {
  UNKNOWN = 0,
  PROPERTY = 1,
  EVENT = 2,
}

/**
 * Angular decorator types supported by the parser.
 */
export enum DecoratorType {
  COMPONENT = "Component",
  INPUT = "Input",
  OUTPUT = "Output",
}

/**
 * TypeScript primitive and common data types.
 */
export enum DataType {
  ANY = "any",
  BOOLEAN = "boolean",
  NULL = "null",
  NUMBER = "number",
  OBJECT = "object",
  STRING = "string",
}

/** The property name used for component selectors in Angular decorators. */
export const SELECTOR_PROPERTY = "selector";

/** Default data type when type cannot be determined. */
export const DEFAULT_DATA_TYPE = DataType.ANY;

/** Type name for Angular's EventEmitter class. */
export const EVENT_EMITTER_TYPE = "EventEmitter";
