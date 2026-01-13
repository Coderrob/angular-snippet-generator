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

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import * as vscode from "vscode";

import {
  ConfigKey,
  Path,
  Platform,
  SnippetLocation,
  SNIPPETS_FILENAME,
} from "./constants";
import { getFileContents, getSupportedFiles } from "./files";
import { parseAngularFile } from "./parser";
import { createSnippet } from "./snippet";
import { Snippet } from "./types";

/** Quick pick items for location selection. */
interface LocationQuickPickItem extends vscode.QuickPickItem {
  readonly location:
    | typeof SnippetLocation.WORKSPACE
    | typeof SnippetLocation.USER;
}

/**
 * Gets the VS Code user snippets directory path based on the current platform.
 * @returns The path to the user snippets directory.
 */
const getUserSnippetsDirectory = (): string => {
  const homeDir = os.homedir();

  switch (process.platform) {
    case Platform.WINDOWS:
      return path.join(
        process.env[Path.APPDATA_ENV] ||
          path.join(homeDir, "AppData", "Roaming"),
        Path.CODE_DIR,
        Path.USER_DIR,
        Path.SNIPPETS_DIR
      );
    case Platform.MACOS:
      return path.join(
        homeDir,
        "Library",
        "Application Support",
        Path.CODE_DIR,
        Path.USER_DIR,
        Path.SNIPPETS_DIR
      );
    default:
      return path.join(
        homeDir,
        Path.CONFIG_DIR,
        Path.CODE_DIR,
        Path.USER_DIR,
        Path.SNIPPETS_DIR
      );
  }
};

/**
 * Gets the workspace .vscode snippets directory path.
 * @param workspaceFolder - The workspace folder to use.
 * @returns The path to the workspace snippets directory or undefined if no workspace.
 */
const getWorkspaceSnippetsDirectory = (
  workspaceFolder?: vscode.WorkspaceFolder
): string | undefined => {
  if (!workspaceFolder) {
    return undefined;
  }
  return path.join(workspaceFolder.uri.fsPath, Path.VSCODE_DIR);
};

/**
 * Gets the configured snippet location preference.
 * @returns The configured location preference.
 */
const getSnippetLocationConfig = (): SnippetLocation => {
  const config = vscode.workspace.getConfiguration(ConfigKey.SECTION);
  return config.get<SnippetLocation>(
    ConfigKey.SNIPPET_LOCATION,
    SnippetLocation.WORKSPACE
  );
};

/**
 * Prompts the user to select where to save snippets.
 * @param hasWorkspace - Whether a workspace is available.
 * @returns The selected location or undefined if cancelled.
 */
const promptForLocation = async (
  hasWorkspace: boolean
): Promise<SnippetLocation | undefined> => {
  const items: LocationQuickPickItem[] = [];

  if (hasWorkspace) {
    items.push({
      label: "$(folder) Workspace (.vscode folder)",
      description: "Recommended for team projects",
      detail: "Snippets will be saved to .vscode/angular.code-snippets",
      location: SnippetLocation.WORKSPACE,
    });
  }

  items.push({
    label: "$(home) User Snippets",
    description: "Available across all projects",
    detail: "Snippets will be saved to your global VS Code snippets folder",
    location: SnippetLocation.USER,
  });

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Where would you like to save the Angular snippets?",
    title: "Select Snippet Location",
  });

  return selected?.location;
};

/**
 * Determines the snippets directory based on configuration and context.
 * @param uri - The URI of the selected folder.
 * @returns The snippets directory path or undefined if cancelled.
 */
const resolveSnippetsDirectory = async (
  uri: vscode.Uri
): Promise<string | undefined> => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  const configuredLocation = getSnippetLocationConfig();

  if (configuredLocation === SnippetLocation.ASK) {
    const location = await promptForLocation(!!workspaceFolder);
    if (!location) {
      return undefined;
    }
    return location === SnippetLocation.WORKSPACE && workspaceFolder
      ? getWorkspaceSnippetsDirectory(workspaceFolder)
      : getUserSnippetsDirectory();
  }

  if (configuredLocation === SnippetLocation.WORKSPACE && workspaceFolder) {
    return getWorkspaceSnippetsDirectory(workspaceFolder);
  }

  if (configuredLocation === SnippetLocation.WORKSPACE && !workspaceFolder) {
    vscode.window.showWarningMessage(
      "No workspace folder found. Saving to user snippets instead."
    );
  }

  return getUserSnippetsDirectory();
};

/**
 * Ensures the snippets directory exists.
 * @param dirPath - The directory path to create if needed.
 */
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Loads existing snippets from a file.
 * @param filePath - The path to the snippets file.
 * @returns The existing snippets or an empty object.
 */
const loadExistingSnippets = (filePath: string): Record<string, unknown> => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content) as Record<string, unknown>;
    }
  } catch {
    // Return empty object if file doesn't exist or is invalid
  }
  return {};
};

/**
 * Saves snippets to the specified snippets directory.
 * @param snippets - The snippets to save.
 * @param snippetsDir - The directory to save snippets to.
 * @returns The path to the saved snippets file.
 */
const saveSnippets = (
  snippets: Record<string, unknown>,
  snippetsDir: string
): string => {
  ensureDirectoryExists(snippetsDir);

  const snippetsPath = path.join(snippetsDir, SNIPPETS_FILENAME);
  const existingSnippets = loadExistingSnippets(snippetsPath);
  const mergedSnippets = { ...existingSnippets, ...snippets };

  fs.writeFileSync(snippetsPath, JSON.stringify(mergedSnippets, null, 2));
  return snippetsPath;
};

/**
 * Generates Angular snippets from a directory of Angular files.
 * Supports components, directives, and pipes.
 * @param dirPath - The directory path to scan for Angular files.
 * @returns Object containing the generated snippets and count.
 */
const generateSnippetsFromDirectory = (
  dirPath: string
): { snippets: Record<string, unknown>; count: number } => {
  const angularFiles = getSupportedFiles(dirPath);
  const snippets: Record<string, unknown> = {};
  let count = 0;

  for (const filePath of angularFiles) {
    const fileContents = getFileContents(filePath);
    const angularInfo = parseAngularFile(fileContents);

    if (angularInfo) {
      const snippet = createSnippet(angularInfo);
      if (snippet) {
        Object.assign(snippets, snippet);
        count++;
      }
    }
  }

  return { snippets, count };
};

/**
 * Merges a snippet into the accumulated snippets object.
 * @param accumulated - The accumulated snippets.
 * @param snippet - The snippet to merge.
 * @returns The merged snippets object.
 */
export const mergeSnippet = (
  accumulated: Record<string, unknown>,
  snippet: Snippet | undefined
): Record<string, unknown> => {
  if (snippet) {
    return { ...accumulated, ...snippet };
  }
  return accumulated;
};

/**
 * Command handler for creating Angular snippets from a directory.
 * @param uri - The URI of the selected folder.
 */
const createSnippetsCommand = async (uri: vscode.Uri): Promise<void> => {
  if (!uri?.fsPath) {
    vscode.window.showErrorMessage(
      "Please select a folder to generate snippets from."
    );
    return;
  }

  try {
    const snippetsDir = await resolveSnippetsDirectory(uri);
    if (!snippetsDir) {
      return; // User cancelled the location prompt
    }

    const { snippets, count } = generateSnippetsFromDirectory(uri.fsPath);

    if (count === 0) {
      vscode.window.showWarningMessage(
        "No Angular component files found in the selected directory."
      );
      return;
    }

    const snippetsPath = saveSnippets(snippets, snippetsDir);
    const isWorkspace = snippetsDir.includes(Path.VSCODE_DIR);
    const locationLabel = isWorkspace ? "workspace .vscode" : "user snippets";

    vscode.window.showInformationMessage(
      `Generated ${count} Angular snippet(s) to ${locationLabel}: ${snippetsPath}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    vscode.window.showErrorMessage(`Failed to generate snippets: ${message}`);
  }
};

/**
 * Activates the Angular Snippet Generator extension.
 * @param context - The VS Code extension context.
 */
export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "angular-snippet-generator.createSnippets",
    createSnippetsCommand
  );
  context.subscriptions.push(disposable);
}

/**
 * Deactivates the Angular Snippet Generator extension.
 */
export function deactivate(): void {
  // No cleanup required
}
