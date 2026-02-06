# Contributing Guide

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Development Setup

1. Fork the repository on GitHub

2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/claude-code-gcalendar-skill.git
cd claude-code-gcalendar-skill
```

3. Install dependencies:

```bash
npm install
```

4. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Code Style

This project uses:
- **TypeScript** for type safety
- **ESLint** for linting
- **Prettier** for formatting

Run linting and formatting:

```bash
npm run lint
npm run lint:fix
```

### Testing

All contributions should include tests:

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run functional tests
npm run test:functional

# Generate coverage report
npm run test:coverage
```

**Coverage Requirements:**
- Unit tests: 90%+
- Integration tests: 80%+
- Functional tests: 70%+
- Overall: 85%+

### Building

Build the project:

```bash
npm run build
```

### Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code restructuring
test: adding tests
chore: maintenance
```

Example:
```
feat(availability): add multi-calendar support
```

## Submitting Changes

1. Ensure all tests pass
2. Ensure coverage meets requirements
3. Update documentation if needed
4. Push your changes:

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request

## Pull Request Guidelines

- PRs should be focused (one feature/fix per PR)
- Include a clear description
- Link related issues
- Include screenshots for UI changes
- Ensure CI passes
- Request review from maintainers

## Reporting Issues

When reporting issues, include:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node.js version)
- Error messages/logs

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct.html).

## Questions?

Open an issue for discussion or reach out to maintainers.
