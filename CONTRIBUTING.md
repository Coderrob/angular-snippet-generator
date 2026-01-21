# Contributing

Thank you for your interest in contributing to the Angular Snippet Generator! This document provides guidelines and information for contributors.

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Development Setup

1. **Prerequisites**
   - Node.js 22.x or later
   - Visual Studio Code
   - Git

1. **Clone and Setup**

   ```bash
   git clone https://github.com/Coderrob/angular-snippet-generator.git
   cd angular-snippet-generator
   npm install
   ```

1. **Development Workflow**

   ```bash
   # Start development mode
   npm run watch

   # Run tests
   npm test

   # Run linting
   npm run lint

   # Format code
   npm run format
   ```

### Development Process

1. **Choose an Issue**: Look for issues labeled `good first issue` or `help wanted`
1. **Create a Branch**: Use descriptive branch names (e.g., `feature/add-pipe-support`, `fix/selector-parsing`)
1. **Make Changes**: Follow the coding standards below
1. **Test Thoroughly**: Ensure all tests pass and add new tests for new features
1. **Update Documentation**: Update README.md, CHANGELOG.md, or other docs as needed
1. **Submit a Pull Request**: Follow the PR template and reference any related issues

### Coding Standards

#### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`

#### Commit Messages

Follow conventional commit format:

```text
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

#### Testing

- Write unit tests for new functionality
- Maintain >95% code coverage
- Test both positive and negative scenarios
- Use descriptive test names following "should ..." pattern

### Architecture Guidelines

- **Single Responsibility**: Each module/function should have one clear purpose
- **Dependency Injection**: Use interfaces for external dependencies
- **Pure Functions**: Prefer side-effect-free functions where possible
- **Type Safety**: Leverage TypeScript's type system fully
- **Error Handling**: Provide meaningful error messages

### File Organization

```text
src/
├── extension.ts      # Main extension entry point
├── parser.ts         # Angular file parsing logic
├── snippet.ts        # Snippet generation
├── files.ts          # File system operations
├── nodes.ts          # AST utilities
├── types.ts          # Type definitions
├── constants.ts      # Configuration constants
├── strings.ts        # String utilities
└── test/             # Test files
```

### Pull Request Process

1. **Before Submitting**:
   - Ensure all tests pass: `npm test`
   - Run quality checks: `npm run quality`
   - Update CHANGELOG.md for user-facing changes
   - Test the extension in VS Code Extension Development Host

1. **PR Description**:
   - Clearly describe the changes
   - Reference related issues
   - Include screenshots for UI changes
   - List any breaking changes

1. **Review Process**:
   - At least one maintainer review required
   - Address review feedback
   - CI checks must pass
   - Squash commits before merge

### Issue Reporting

When reporting bugs or requesting features:

- **Bug Reports**: Include steps to reproduce, expected vs actual behavior, environment details
- **Feature Requests**: Describe the use case, provide examples, explain the benefit
- **Questions**: Check existing documentation first, then use discussions

### Recognition

Contributors are recognized in:

- CHANGELOG.md for significant contributions
- GitHub's contributor insights
- Release notes

### Getting Help

- **Documentation**: Check README.md and ARCHITECTURE.md
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs or request features via GitHub Issues

Thank you for contributing to make Angular Snippet Generator better! 🚀
