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
import { ISnippet } from "./types";

/** JSON indentation spaces for snippet files. */
const JSON_INDENT = 2;

/** Quick pick items for location selection. */
interface ILocationQuickPickItem extends vscode.QuickPickItem {
  readonly location:
    | typeof SnippetLocation.WORKSPACE
    | typeof SnippetLocation.USER;
}

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
 * Builds the list of location quick pick items for the prompt.
 * @param workspaceFolder - The optional workspace folder.
 * @returns Array of location quick pick items.
 */
const buildLocationItems = (
  workspaceFolder?: vscode.WorkspaceFolder
): ILocationQuickPickItem[] => {
  const items: ILocationQuickPickItem[] = [];
  if (workspaceFolder) {
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
  return items;
};

/**
 * Command handler for creating Angular code snippets from a directory.
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
      return;
    }
    await executeSnippetGeneration(uri, snippetsDir);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    vscode.window.showErrorMessage(`Failed to generate snippets: ${message}`);
  }
};

/**
 * Deactivates the Angular Snippet Generator extension.
 */
export function deactivate(): void {
  // No cleanup required
}

/**
 * Ensures the snippets directory exists, creating it if necessary.
 * @param dirPath - The directory path to create if needed.
 */
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Executes snippet generation for a folder and saves results.
 * @param uri - The folder URI.
 * @param snippetsDir - The target snippets directory.
 */
const executeSnippetGeneration = async (
  uri: vscode.Uri,
  snippetsDir: string
): Promise<void> => {
  const { snippets, count } = generateSnippetsFromDirectory(uri.fsPath);
  if (count === 0) {
    handleNoSnippets();
    return;
  }
  const snippetsPath = saveSnippets(snippets, snippetsDir);
  showSnippetSuccess(count, snippetsPath, snippetsDir);
};

/**
 * Generates Angular code snippets from a directory of Angular files.
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
 * Gets the Linux VS Code user snippets directory path.
 * @param homeDir - The user home directory.
 * @returns The Linux snippets directory path.
 */
const getLinuxSnippetsDir = (homeDir: string): string =>
  path.join(
    homeDir,
    Path.CONFIG_DIR,
    Path.CODE_DIR,
    Path.USER_DIR,
    Path.SNIPPETS_DIR
  );

/**
 * Gets the macOS VS Code user snippets directory path.
 * @param homeDir - The user home directory.
 * @returns The macOS snippets directory path.
 */
const getMacosSnippetsDir = (homeDir: string): string =>
  path.join(
    homeDir,
    "Library",
    "Application Support",
    Path.CODE_DIR,
    Path.USER_DIR,
    Path.SNIPPETS_DIR
  );

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
 * Gets the VS Code user snippets directory path based on the current platform.
 * @returns The path to the user snippets directory.
 */
const getUserSnippetsDirectory = (): string => {
  const homeDir = os.homedir();
  switch (process.platform) {
    case Platform.WINDOWS:
      return getWindowsSnippetsDir(homeDir);
    case Platform.MACOS:
      return getMacosSnippetsDir(homeDir);
    default:
      return getLinuxSnippetsDir(homeDir);
  }
};

/**
 * Gets the Windows VS Code user snippets directory path.
 * @param homeDir - The user home directory.
 * @returns The Windows snippets directory path.
 */
const getWindowsSnippetsDir = (homeDir: string): string =>
  path.join(
    process.env[Path.APPDATA_ENV] || path.join(homeDir, "AppData", "Roaming"),
    Path.CODE_DIR,
    Path.USER_DIR,
    Path.SNIPPETS_DIR
  );

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
 * Shows a warning when no Angular snippets were found in the selected directory.
 */
const handleNoSnippets = (): void => {
  vscode.window.showWarningMessage(
    "No Angular component files found in the selected directory."
  );
};

/**
 * Type guard that checks whether a value is a non-null plain object record.
 * @param value - The value to test.
 * @returns True if value is a non-null object.
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Loads existing snippets from a file.
 * @param filePath - The path to the snippets file.
 * @returns The existing snippets or an empty object.
 */
const loadExistingSnippets = (filePath: string): Record<string, unknown> => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed: unknown = JSON.parse(content);
      return isRecord(parsed) ? parsed : {};
    }
  } catch (error) {
    console.warn("Failed to parse snippets file:", error);
  }
  return {};
};

/**
 * Merges a snippet into the accumulated snippets object.
 * @param accumulated - The accumulated snippets.
 * @param snippet - The snippet to merge.
 * @returns The merged snippets object.
 */
export const mergeSnippet = (
  accumulated: Record<string, unknown>,
  snippet: ISnippet | undefined
): Record<string, unknown> => {
  if (snippet) {
    return { ...accumulated, ...snippet };
  }
  return accumulated;
};

/**
 * Prompts the user to select where to save snippets.
 * @param workspaceFolder - The optional workspace folder.
 * @returns The selected location or undefined if cancelled.
 */
const promptForLocation = async (
  workspaceFolder?: vscode.WorkspaceFolder
): Promise<SnippetLocation | undefined> => {
  const selected = await vscode.window.showQuickPick(
    buildLocationItems(workspaceFolder),
    {
      placeHolder: "Where would you like to save the Angular code snippets?",
      title: "Select Snippet Location",
    }
  );
  return selected?.location;
};

/**
 * Resolves the snippets directory when the location is set to Ask.
 * @param workspaceFolder - The optional workspace folder.
 * @returns The resolved snippets directory or undefined if cancelled.
 */
const resolveAskLocation = async (
  workspaceFolder?: vscode.WorkspaceFolder
): Promise<string | undefined> => {
  const location = await promptForLocation(workspaceFolder);
  if (!location) {
    return undefined;
  }
  return location === SnippetLocation.WORKSPACE && workspaceFolder
    ? getWorkspaceSnippetsDirectory(workspaceFolder)
    : getUserSnippetsDirectory();
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
    return resolveAskLocation(workspaceFolder);
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
  fs.writeFileSync(
    snippetsPath,
    JSON.stringify(mergedSnippets, null, JSON_INDENT)
  );
  return snippetsPath;
};

/**
 * Shows a success message after snippets are saved.
 * @param count - Number of snippets generated.
 * @param snippetsPath - Path to the saved snippets file.
 * @param snippetsDir - The snippets directory used.
 */
const showSnippetSuccess = (
  count: number,
  snippetsPath: string,
  snippetsDir: string
): void => {
  const isWorkspace = snippetsDir.includes(Path.VSCODE_DIR);
  const locationLabel = isWorkspace ? "workspace .vscode" : "user snippets";
  vscode.window.showInformationMessage(
    `Generated ${count} Angular code snippet(s) to ${locationLabel}: ${snippetsPath}`
  );
};
