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

/**
 * Represents an Angular component's metadata extracted from source code.
 */
export interface ComponentInfo {
  /** The type of Angular artifact. */
  readonly kind: typeof ArtifactKind.COMPONENT;
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
 * Represents an Angular directive's metadata extracted from source code.
 */
export interface DirectiveInfo {
  /** The type of Angular artifact. */
  readonly kind: typeof ArtifactKind.DIRECTIVE;
  /** The class name of the directive. */
  readonly className: string;
  /** The directive's selector attribute value (typically an attribute selector). */
  readonly selector: string;
  /** The directive's @Input decorated properties. */
  readonly inputs: readonly Property[];
  /** The directive's @Output decorated properties. */
  readonly outputs: readonly Property[];
}

/**
 * Represents an Angular pipe's metadata extracted from source code.
 */
export interface PipeInfo {
  /** The type of Angular artifact. */
  readonly kind: typeof ArtifactKind.PIPE;
  /** The class name of the pipe. */
  readonly className: string;
  /** The pipe's name used in templates. */
  readonly name: string;
}

/**
 * Union type for all Angular artifact metadata.
 */
export type AngularInfo = ComponentInfo | DirectiveInfo | PipeInfo;

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
  DIRECTIVE = "Directive",
  PIPE = "Pipe",
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

/** The property name used for pipe names in Angular decorators. */
export const NAME_PROPERTY = "name";

/** Default data type when type cannot be determined. */
export const DEFAULT_DATA_TYPE = DataType.ANY;

/** Type name for Angular's EventEmitter class. */
export const EVENT_EMITTER_TYPE = "EventEmitter";
