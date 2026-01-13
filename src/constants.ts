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

/** Snippet location options for saving generated snippets. */
export enum SnippetLocation {
  WORKSPACE = "workspace",
  USER = "user",
  ASK = "ask",
}

/** Angular artifact type discriminators. */
export enum ArtifactKind {
  COMPONENT = "component",
  DIRECTIVE = "directive",
  PIPE = "pipe",
}

/** Configuration key names for VS Code settings. */
export enum ConfigKey {
  SECTION = "angularSnippetGenerator",
  SNIPPET_LOCATION = "snippetLocation",
}

/** File system paths and names. */
export enum Path {
  VSCODE_DIR = ".vscode",
  CODE_DIR = "Code",
  USER_DIR = "User",
  SNIPPETS_DIR = "snippets",
  CONFIG_DIR = ".config",
  APPDATA_ENV = "APPDATA",
}

/** Filename for generated Angular snippets. */
export const SNIPPETS_FILENAME = "angular.code-snippets";

/** Operating system platform identifiers. */
export enum Platform {
  WINDOWS = "win32",
  MACOS = "darwin",
  LINUX = "linux",
}
