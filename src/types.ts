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

/* eslint-disable @typescript-eslint/naming-convention */

export type ComponentInfo = {
  className: string;
  selector: string;
  inputs: Property[];
  outputs: Property[];
};
export type Property = {
  name: string;
  type: string | DataType | undefined;
};
export type Snippet = {
  [key: string]: {
    body: any[];
    description: string;
    prefix: string[];
    scope: string;
  };
};
export enum PropertyKind {
  UNKNOWN = 0,
  PROPERTY = 1,
  EVENT = 2,
}
export enum DecoratorType {
  COMPONENT = 'Component',
  INPUT = 'Input',
  OUTPUT = 'Output',
}
export enum DataType {
  ANY = 'any',
  BOOLEAN = 'boolean',
  NULL = 'null',
  NUMBER = 'number',
  OBJECT = 'object',
  STRING = 'string',
}
export const SELECTOR_PROPERTY = 'selector';
export const DEFAULT_DATA_TYPE = DataType.ANY;
export const EVENT_EMITTER_TYPE = 'EventEmitter';
