# Angular Snippet Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Coverage](https://img.shields.io/badge/coverage-99%25-brightgreen.svg)
[![ESLint](https://img.shields.io/badge/ESLint-9.x-4B32C3.svg)](https://eslint.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

## Overview

Angular Snippet Generator is a Visual Studio Code extension designed to streamline
Angular development by automatically generating code snippets from component source files.
It simplifies repetitive tasks, improves productivity, and ensures consistency in your
Angular projects.

## Features

- **Automatic Snippet Generation**: Parses Angular component files and generates VS Code snippets.
- **Input/Output Detection**: Extracts `@Input()` and `@Output()` decorated properties.
- **Type-Aware**: Generates appropriate snippet placeholders based on property types.
- **Get Accessor Support**: Handles getter-based input properties.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. [Download Node.js](https://nodejs.org/)
- **Visual Studio Code**: Install VS Code. [Download VS Code](https://code.visualstudio.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Coderrob/angular-snippet-generator.git
   ```

2. Navigate to the project directory:

   ```bash
   cd angular-snippet-generator
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Usage

1. Open the project in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. In the new VS Code window, open an Angular project.
4. **Right-click on any folder** in the Explorer sidebar.
5. Select **"Create Angular Snippets"** from the context menu.
6. The extension will:
   - Scan the folder recursively for Angular component files (`.component.ts`)
   - Parse each component to extract inputs, outputs, and metadata
   - Generate VS Code snippets with proper tab stops and placeholders
   - Save the snippets based on your configuration (see below)
7. Start typing the component selector in any HTML file to use the generated snippets.

### Configuration

Configure where snippets are saved via VS Code settings:

| Setting | Options | Description |
| ------- | ------- | ----------- |
| `angularSnippetGenerator.snippetLocation` | `workspace` (default) | Save to `.vscode/angular.code-snippets` in your project |
| | `user` | Save to your global VS Code user snippets folder |
| | `ask` | Prompt each time to choose the location |

**Workspace (`.vscode` folder)** is recommended for team projects because:

- Snippets are project-specific and relevant to your Angular components
- Can be committed to version control and shared with teammates
- Keeps your global snippets folder clean

**User snippets** are useful when you want snippets available across all projects.

### Generated Snippet Example

For a component like:

```typescript
@Component({
  selector: 'app-save-button'
})
export class SaveButtonComponent {
  @Input() label: string;
  @Input() disabled: boolean;
  @Output() save = new EventEmitter<void>();
}
```

The extension generates a snippet that expands to:

```html
<app-save-button
  [label]="$1"
  [disabled]="${2|true,false|}"
  (save)="$3:onSave($event)"
></app-save-button>
```

## Development

### Available Scripts

| Script | Description |
| ------ | ----------- |
| `npm run compile` | Build the extension with webpack |
| `npm run watch` | Watch mode for development |
| `npm run lint` | Run ESLint and code duplication checks |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run test:unit` | Run unit tests |
| `npm run coverage` | Run tests with coverage report |
| `npm run package` | Create production build |

### Running Tests

```bash
# Compile and run unit tests
npm run compile-tests && npm run test:unit

# Run with coverage
npm run coverage
```

## Code Quality

This project enforces strict code quality standards:

### Linting & Formatting

- **ESLint 9.x** with flat config format
- **Prettier** for consistent code formatting
- **JSDoc** required for all exported functions
- **Import sorting** by groups (builtin → external → internal)

### Testing

- **Mocha** test framework with TDD style
- **Truth table patterns** for comprehensive test coverage
- **95%+ code coverage** threshold enforced

### Code Duplication

- **jscpd** checks for code duplication
- **2% maximum** duplication threshold

## Project Structure

```text
src/
├── extension.ts    # VS Code extension entry point
├── files.ts        # File system utilities
├── nodes.ts        # TypeScript AST node utilities
├── parser.ts       # Angular component parser
├── snippet.ts      # Snippet generation logic
├── strings.ts      # String manipulation utilities
├── types.ts        # Type definitions and enums
└── test/
    └── suite/      # Unit tests
```

## Best Practices

### Architecture

- **Composition over inheritance**: Functions compose smaller utilities.
- **Dependency injection**: File system operations use injectable providers.
- **Pure functions**: Side-effect-free logic for testability.
- **Single responsibility**: Each module has a focused purpose.

### Code Standards

- All exported functions require JSDoc with `@param` and `@returns`.
- Use `const` arrow functions for consistency.
- Prefer early returns over nested conditionals.
- Use TypeScript strict mode.

### Testing Standards

- Test descriptions follow "should ... do X" pattern.
- Use truth tables for parameterized testing.
- Cover positive cases, negative cases, and edge cases.
- Mock external dependencies (file system, VS Code API).

## Support

If you encounter any issues or have questions, please open an issue on the
[GitHub repository](https://github.com/Coderrob/angular-snippet-generator/issues).

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Ensure tests pass (`npm run coverage`).
4. Ensure linting passes (`npm run lint`).
5. Commit changes (`git commit -m 'Add amazing feature'`).
6. Push to branch (`git push origin feature/amazing-feature`).
7. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Ownership

This repository is maintained by **Rob "Coderrob" Lindley**. For inquiries, please contact via GitHub.
