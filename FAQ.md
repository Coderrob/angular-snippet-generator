# Frequently Asked Questions

## General Questions

### What is Angular Snippet Generator?

Angular Snippet Generator is a Visual Studio Code extension that automatically generates code snippets for Angular components, directives, and pipes. It analyzes your TypeScript source files and creates reusable VS Code snippets that help you quickly insert Angular component usage in your templates.

### How does it work?

The extension parses your Angular TypeScript files using the TypeScript Compiler API, extracts metadata from Angular decorators (`@Component`, `@Directive`, `@Pipe`), and generates VS Code snippet files with appropriate tab stops and placeholders.

### Is it free?

Yes! Angular Snippet Generator is completely free and open source under the Apache 2.0 license.

## Installation & Setup

### How do I install the extension?

1. Open VS Code
1. Go to Extensions (Ctrl+Shift+X)
1. Search for "Angular Snippet Generator"
1. Click Install

Alternatively, you can install it from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=coderrob.angular-snippet-generator).

### What are the system requirements?

- **VS Code**: 1.76.0 or later
- **Node.js**: 22.x (for development only)
- **Operating System**: Windows, macOS, or Linux

### Do I need Angular CLI?

No, the extension works with any Angular project structure. It doesn't require Angular CLI to be installed.

## Usage

### How do I generate snippets?

1. Open an Angular project in VS Code
1. Right-click on any folder in the Explorer sidebar
1. Navigate to "Code Snippets" → "Create Angular Snippets"
1. The extension will scan for Angular files and generate snippets

### What file types are supported?

The extension processes files with these extensions:

- `.component.ts` - Angular components
- `.directive.ts` - Angular directives
- `.pipe.ts` - Angular pipes

### Where are snippets saved?

You can configure where snippets are saved:

- **`workspace`**: `.vscode/angular.code-snippets` - Team projects (recommended)
- **`user`**: Global VS Code snippets folder - Personal use across projects
- **`ask`**: Prompt each time - Maximum control

### Can I customize the snippet format?

Currently, the snippet format is fixed, but you can modify the generated snippet files manually after creation. Future versions may support custom templates.

## Troubleshooting

### The "Code Snippets" menu doesn't appear

**Possible causes:**

- Extension not activated: Reload VS Code (Ctrl+Shift+P → "Developer: Reload Window")
- Wrong context: Right-click must be on a folder in Explorer, not files or empty space
- Extension disabled: Check Extensions view to ensure it's enabled

### No snippets are generated

**Check these:**

- Verify Angular files exist with correct extensions (`.component.ts`, etc.)
- Ensure files contain proper Angular decorators (`@Component()`, etc.)
- Check that components have `selector` properties
- Look at VS Code output panel for error messages

### Snippets aren't appearing in IntelliSense

**Solutions:**

- Reload VS Code after generating snippets
- Ensure you're editing HTML files (snippets are scoped to HTML)
- Check that the snippet file was created in the correct location
- Verify the file wasn't corrupted during generation

### Extension shows errors during parsing

**Common issues:**

- Syntax errors in TypeScript files
- Missing or malformed Angular decorators
- Unsupported TypeScript syntax
- Check the VS Code output panel for detailed error messages

### Performance is slow on large projects

**Optimization tips:**

- Generate snippets for specific folders rather than entire workspace
- Close unused files before generation
- Consider excluding `node_modules` and build directories

## Technical Questions

### How does the parsing work?

The extension uses the TypeScript Compiler API to:

1. Parse TypeScript source files into Abstract Syntax Trees (AST)
1. Traverse the AST to find Angular decorator calls
1. Extract metadata from decorator object literals
1. Generate snippet JSON with appropriate placeholders

### What TypeScript features are supported?

- Classes with Angular decorators
- Property decorators (`@Input`, `@Output`)
- String literal selectors
- Basic type annotations
- Getter-based properties

### Are there any limitations?

**Current limitations:**

- Complex TypeScript types may not be fully supported
- Dynamic selectors (non-string literals) are not supported
- Standalone components have limited support
- Custom decorators are not recognized

### Can I contribute to the extension?

Absolutely! See our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Coding standards
- Pull request process
- Issue reporting

## Compatibility

### Which Angular versions are supported?

The extension works with Angular 2+ projects. It analyzes decorator metadata which has been stable across Angular versions.

### Does it work with Angular standalone components?

Basic support is available. Full standalone component support is planned for a future release.

### Can it handle Angular libraries?

Yes, the extension works with Angular libraries the same way as applications, as long as the TypeScript files follow standard Angular patterns.

## Security

### Is my code safe?

The extension only reads your TypeScript files and generates snippet files. It doesn't:

- Send data over the internet
- Modify your source code
- Execute arbitrary code
- Access sensitive information

### Can I review what snippets are generated?

Yes! The extension generates standard VS Code snippet files that you can review and modify before use.

## Roadmap & Future

### What's planned for future versions?

See our [Roadmap](ROADMAP.md) for upcoming features including:

- Standalone component support
- Custom snippet templates
- Performance improvements
- Angular CLI integration

### How can I request features?

- Check existing [GitHub Issues](https://github.com/Coderrob/angular-snippet-generator/issues) for similar requests
- Create a new feature request with detailed description
- Add 👍 reactions to show support for existing requests

## Support

### Where can I get help?

- **Documentation**: Check README.md and ARCHITECTURE.md
- **Issues**: Report bugs at [GitHub Issues](https://github.com/Coderrob/angular-snippet-generator/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/Coderrob/angular-snippet-generator/discussions)

### How do I report a bug?

When reporting bugs, please include:

- VS Code version
- Extension version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)

---

**Still have questions?** Check our [GitHub Discussions](https://github.com/Coderrob/angular-snippet-generator/discussions) or create a new discussion thread!
