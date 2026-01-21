# Roadmap

This document outlines the planned development direction for Angular Snippet Generator. It's a living document that evolves with community feedback and changing priorities.

## Vision

Angular Snippet Generator aims to be the most comprehensive and user-friendly tool for generating VS Code snippets from Angular components, directives, and pipes, making Angular development faster and more efficient.

## Current Status

**Version 0.0.1** - Initial Release ✅

- Basic component, directive, and pipe snippet generation
- VS Code integration with context menus
- Configurable snippet storage locations
- TypeScript-based parsing with AST analysis

## Upcoming Releases

### Version 0.1.0 - Enhanced Features 🚧

**Target Release**: Q1 2026

#### Core Features

- [ ] **Standalone Components Support**: Full support for Angular standalone components
- [ ] **Advanced Type Detection**: Better handling of complex TypeScript types (unions, generics, interfaces)
- [ ] **Custom Snippet Templates**: User-configurable snippet templates
- [ ] **Snippet Preview**: Preview generated snippets before saving

#### Developer Experience

- [ ] **Performance Improvements**: Faster parsing for large codebases
- [ ] **Better Error Messages**: More descriptive error messages and troubleshooting guides
- [ ] **Progress Indicators**: Visual feedback for long-running operations

### Version 0.2.0 - Advanced Features 📋

**Target Release**: Q2 2026

#### Angular Integration

- [ ] **Angular CLI Integration**: Automatic detection of Angular projects
- [ ] **Library Support**: Generate snippets for Angular libraries
- [ ] **Module Detection**: Understand NgModule structure and dependencies

#### Snippet Management

- [ ] **Snippet Organization**: Group snippets by feature/module
- [ ] **Conflict Resolution**: Handle duplicate selectors gracefully
- [ ] **Snippet Updates**: Automatically update snippets when source files change

### Version 0.3.0 - Ecosystem Integration 🔗

**Target Release**: Q3 2026

#### IDE Integration

- [ ] **Multi-IDE Support**: Support for other editors (WebStorm, etc.)
- [ ] **Language Server Protocol**: LSP-based snippet generation
- [ ] **Real-time Updates**: Live snippet updates as you type

#### Community Features

- [ ] **Snippet Sharing**: Share custom snippets with the community
- [ ] **Template Marketplace**: Community-contributed snippet templates
- [ ] **Plugin System**: Extensible architecture for custom parsers

## Long-term Vision (1.0.0+)

### AI-Powered Features 🤖

- **Intelligent Snippet Generation**: AI suggestions for snippet improvements
- **Context-Aware Snippets**: Generate snippets based on usage patterns
- **Natural Language Processing**: Generate snippets from plain English descriptions

### Enterprise Features 🏢

- **Team Collaboration**: Shared snippet libraries for teams
- **Audit Trails**: Track snippet usage and modifications
- **Compliance**: Support for enterprise security and compliance requirements

### Advanced Angular Support

- **Full Angular Ecosystem**: Support for services, guards, resolvers, interceptors
- **Framework Agnostic**: Support for other frameworks (React, Vue, Svelte)
- **Multi-language**: Support for different template languages (Pug, Handlebars)

## Contributing to the Roadmap

We welcome community input on our roadmap! Here's how you can contribute:

### Suggest Features

1. **Check Existing Issues**: Search for similar feature requests
1. **Create a Feature Request**: Use the feature request template
1. **Provide Context**: Explain your use case and why the feature would be valuable

### Vote on Features

- Add 👍 reactions to feature requests you support
- Comment with your specific use cases
- Share how the feature would impact your workflow

### Implementation

- **Small Features**: Can be implemented by community contributors
- **Large Features**: May require core team involvement
- **Breaking Changes**: Will be clearly marked and discussed in advance

## Release Cadence

- **Patch Releases** (0.0.x): Bug fixes and small improvements - as needed
- **Minor Releases** (0.x.0): New features, backwards compatible - quarterly
- **Major Releases** (x.0.0): Breaking changes, major features - annually

## Deprecation Policy

- Features will be deprecated with at least one major version notice
- Deprecated features will be removed in the next major version
- Migration guides will be provided for breaking changes

## Feedback and Support

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussion
- **Documentation**: Comprehensive guides and API references

---

> **Note**: This roadmap is subject to change based on community feedback, technical constraints, and shifting priorities. Last updated: January 2026
